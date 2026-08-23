import { sendAndroidPushNotification } from "../src/lib/telegram/push";

async function testPush() {
  console.log("🚀 جاري اختبار إرسال إشعار تجريبي عبر Firebase FCM إلى تطبيق الأندرويد...\n");

  const result = await sendAndroidPushNotification({
    title: "✨ اختبار إشعار من بوت القوة العاشرة",
    body: "تم ربط النظام وسيرفرات Firebase بنجاح تام! تفضل بالاطلاع على أحدث العروض.",
    screen: "/services",
  });

  console.log("📊 نتيجة الفحص المباشر:");
  console.log(`- النجاح: ${result.success ? "✅ نعم" : "❌ لا"}`);
  console.log(`- معرّف الرسالة من سيرفرات جوجل (Firebase Message ID): ${result.messageId || "لم يتوفر"}`);
  console.log(`- عدد المستلمين المسجلين: ${result.sentCount}`);

  if (result.messageId) {
    console.log("\n🎉 مبروك! خوادم Google Firebase استلمت الإشعار وبثته فوراً لكافة أجهزة الأندرويد.");
  }
}

testPush().catch(console.error);
