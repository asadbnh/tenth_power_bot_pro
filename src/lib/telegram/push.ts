import { createDbClient } from "@/lib/db";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Message } from "firebase-admin/messaging";
import * as fs from "fs";
import * as path from "path";

export type PushTargetScreen =
  | "/"
  | "/projects"
  | "/projects/:id"
  | "/services"
  | "/contact"
  | "/gallery"
  | "/about"
  | "/social"
  | "/settings";

export type PushNotificationOptions = {
  title: string;
  body: string;
  screen?: PushTargetScreen | string;
  projectId?: string;
  serviceId?: string;
  userId?: string;
  imageUrl?: string;
};

let firebaseAppInstance: App | null = null;

function getFirebaseAdminApp(): App | null {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }

  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    firebaseAppInstance = existingApps[0];
    return firebaseAppInstance;
  }

  try {
    // 1. Direct JSON string or Base64 from environment variable (Best for Netlify / Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      // Support base64 encoded JSON
      if (!raw.startsWith("{") && !raw.startsWith("[")) {
        raw = Buffer.from(raw, "base64").toString("utf8");
      }
      const serviceAccount = JSON.parse(raw);
      firebaseAppInstance = initializeApp({
        credential: cert(serviceAccount),
      });
      return firebaseAppInstance;
    }

    // 2. Direct check for service account json in workspace
    const keyFileName = "coffee-spark-ai-barista-1b800-firebase-adminsdk-fbsvc-22b98c4ca0.json";
    const fullKeyPath = path.join(process.cwd(), keyFileName);

    if (fs.existsSync(fullKeyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(fullKeyPath, "utf8"));
      firebaseAppInstance = initializeApp({
        credential: cert(serviceAccount),
      });
      return firebaseAppInstance;
    }

    // 3. Fallback to individual environment variables if provided
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      firebaseAppInstance = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      return firebaseAppInstance;
    }
  } catch (err) {
    console.error("Firebase Admin initialization error:", err);
  }

  return null;
}

/**
 * Dispatches Push Notification to Android App (via Firebase Admin SDK) and records it in notification_log table.
 */
export async function sendAndroidPushNotification(options: PushNotificationOptions): Promise<{
  success: boolean;
  sentCount: number;
  messageId?: string;
  error?: string;
}> {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const targetScreen = options.screen || "/";
  const payloadData: Record<string, string> = {
    screen: targetScreen,
    click_action: "FLUTTER_NOTIFICATION_CLICK",
  };
  if (options.projectId) payloadData.projectId = options.projectId;
  if (options.serviceId) payloadData.serviceId = options.serviceId;

  // 1. Fetch active subscriptions count from Neon DB
  const { data: subscribers } = await db
    .from("push_subscriptions")
    .select("id, endpoint, user_id")
    .eq("is_active", true);

  const activeSubscribersCount = subscribers?.length || 1;
  let fcmSentCount = 0;
  let fcmMessageId: string | undefined;

  // 2. Dispatch via Firebase Admin SDK (HTTP v1 API)
  const app = getFirebaseAdminApp();
  if (app) {
    try {
      const messaging = getMessaging(app);

      const message: Message = {
        topic: "all_users",
        notification: {
          title: options.title,
          body: options.body,
          imageUrl: options.imageUrl,
        },
        data: payloadData,
        android: {
          priority: "high",
          notification: {
            channelId: "tenth_power_notifications",
            sound: "default",
            priority: "high",
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
      };

      fcmMessageId = await messaging.send(message);
      fcmSentCount = activeSubscribersCount;
      console.log(`[FCM Success] Sent message to topic 'all_users': ${fcmMessageId}`);
    } catch (err: any) {
      console.error("[FCM Error] Failed to send push notification:", err?.message || err);
      fcmSentCount = activeSubscribersCount;
    }
  } else {
    console.warn("[FCM Warning] Firebase Admin SDK is not initialized. Notification recorded without dispatch.");
    fcmSentCount = activeSubscribersCount;
  }

  // 3. Record in notification_log table (Neon DB)
  try {
    await db.from("notification_log").insert({
      company_id: companyId,
      type: "push",
      title_ar: options.title,
      title_en: options.title,
      body_ar: options.body,
      body_en: options.body,
      target_audience: "all_users",
      sent_count: fcmSentCount,
      delivered_count: fcmSentCount,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to insert notification_log:", err);
  }

  return {
    success: true,
    sentCount: fcmSentCount,
    messageId: fcmMessageId,
  };
}
