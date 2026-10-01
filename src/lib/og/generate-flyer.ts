import sharp from "sharp";
import fs from "fs";
import path from "path";

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}

function wrapArabicText(text: string, maxCharsPerLine = 34): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 2);
}

export interface FlyerOgOptions {
  title: string;
  category?: string;
  companyName?: string;
  phone?: string;
  whatsapp?: string;
  coverImageUrl?: string;
  locale?: string;
}

export async function generateFlyerOgImage(options: FlyerOgOptions): Promise<Buffer> {
  const {
    title,
    category = options.locale === "en" ? "Tips & Articles" : "نصائح وإرشادات",
    companyName = options.locale === "en" ? "Tenth Power Glass Est." : "مؤسسة القوة العاشرة للزجاج",
    phone = "+966 53 243 8253",
    coverImageUrl,
    locale = "ar",
  } = options;

  const isAr = locale === "ar";
  const width = 1200;
  const height = 630;

  let bgBuffer: Buffer | null = null;

  // 1. Try to load cover image
  if (coverImageUrl) {
    try {
      if (coverImageUrl.startsWith("http://") || coverImageUrl.startsWith("https://")) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(coverImageUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const ab = await res.arrayBuffer();
          bgBuffer = Buffer.from(ab);
        }
      } else {
        const cleanPath = coverImageUrl.replace(/^\//, "");
        const localPath = path.join(process.cwd(), "public", cleanPath);
        if (fs.existsSync(/* turbopackIgnore: true */ localPath)) {
          bgBuffer = fs.readFileSync(/* turbopackIgnore: true */ localPath);
        }
      }
    } catch {
      // ignore, will use default fallback
    }
  }

  // 2. Fallback to default public image if needed
  if (!bgBuffer) {
    const fallbackPaths = [
      path.join(process.cwd(), "public", "images", "twenty-five-commercial-center-facade-1.webp"),
      path.join(process.cwd(), "public", "images", "hero.webp"),
      path.join(process.cwd(), "public", "images", "bakery-pastry-glass-display-counter.webp"),
    ];
    for (const fb of fallbackPaths) {
      if (fs.existsSync(/* turbopackIgnore: true */ fb)) {
        try {
          bgBuffer = fs.readFileSync(/* turbopackIgnore: true */ fb);
          break;
        } catch {
          // try next
        }
      }
    }
  }

  // 3. Prepare Base Sharp Pipeline
  let basePipeline: any;
  if (bgBuffer) {
    try {
      const processedBg = await sharp(bgBuffer)
        .resize(width, height, { fit: "cover", position: "center" })
        .modulate({ brightness: 0.65, saturation: 1.15 })
        .blur(1.5)
        .toBuffer();
      basePipeline = sharp(processedBg);
    } catch {
      basePipeline = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 10, g: 17, b: 35, alpha: 1 },
        },
      });
    }
  } else {
    basePipeline = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 10, g: 17, b: 35, alpha: 1 },
      },
    });
  }

  // 4. Title typography & wrapping
  const titleLines = wrapArabicText(title, isAr ? 34 : 45);
  const titleSvgSpans = titleLines
    .map((line, idx) => {
      const xPos = isAr ? 1100 : 100;
      const dy = idx === 0 ? 0 : 58;
      return `<tspan x="${xPos}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  const textAnchor = isAr ? "end" : "start";
  const subPrompt = isAr
    ? "💡 أحدث حلول وتقنيات الزجاج والواجهات المعمارية"
    : "💡 Modern Architectural Glass & Aluminum Solutions";
  const bottomHint = isAr
    ? "👆 اضغط على الصورة في أي مكان للانتقال مباشرة إلى المقال والتواصل الفوري"
    : "👆 Click anywhere on this card to read the article & connect with us";

  const callBtnTitle = isAr ? "اتصل للمعاينة والاستفسار" : "Call for Consultation";
  const waBtnTitle = isAr ? "تواصل واستشرنا عبر واتساب" : "Chat via WhatsApp";
  const waBtnSub = isAr ? "رد فوري لاستفسارات المشاريع والمقاولات" : "Instant reply for engineering inquiries";

  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Dark modern glassmorphic vignette -->
        <linearGradient id="bgVignette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#050b1a" stop-opacity="0.82" />
          <stop offset="45%" stop-color="#091224" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#020611" stop-opacity="0.96" />
        </linearGradient>

        <!-- WhatsApp Green Gradient -->
        <linearGradient id="waGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#25D366" />
          <stop offset="100%" stop-color="#128C7E" />
        </linearGradient>

        <!-- Golden accent gradient -->
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>

        <!-- Soft drop shadow for elements -->
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6" />
        </filter>

        <!-- Sticker drop shadow -->
        <filter id="stickerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.4" />
        </filter>
      </defs>

      <!-- 1. Background Overlay -->
      <rect width="${width}" height="${height}" fill="url(#bgVignette)" />

      <!-- Golden decorative top border -->
      <rect x="0" y="0" width="${width}" height="6" fill="url(#goldGrad)" />

      <!-- 2. Header: Company Brand & Category Badge -->
      <g>
        <!-- Company Pill -->
        <rect x="70" y="38" width="340" height="46" rx="23" fill="rgba(255,255,255,0.08)" stroke="rgba(212,175,55,0.4)" stroke-width="1.5" />
        <circle cx="95" cy="61" r="14" fill="#f59e0b" />
        <text x="95" y="67" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="15" font-weight="900" fill="#000000" text-anchor="middle">10</text>
        <text x="125" y="68" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="16" font-weight="bold" fill="#f8fafc">
          ${escapeXml(companyName)}
        </text>

        <!-- Category Tag -->
        <rect x="940" y="38" width="190" height="46" rx="23" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1.5" />
        <text x="1035" y="68" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="18" font-weight="bold" fill="#fef3c7" text-anchor="middle">
          ${escapeXml(category)}
        </text>
      </g>

      <!-- 3. Article Title (Prominent, High Contrast) -->
      <text x="${isAr ? 1100 : 100}" y="180" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="46" font-weight="900" fill="#ffffff" text-anchor="${textAnchor}" filter="url(#cardShadow)">
        ${titleSvgSpans}
      </text>

      <!-- Subtitle badge / prompt -->
      <rect x="${isAr ? 730 : 100}" y="270" width="370" height="38" rx="19" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
      <text x="${isAr ? 915 : 285}" y="295" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="17" font-weight="600" fill="#93c5fd" text-anchor="middle">
        ${escapeXml(subPrompt)}
      </text>

      <!-- 4. Interactive Flyer CTA Area (The exact requested feature) -->
      <g transform="translate(0, 365)">

        <!-- Center floating Instagram-style "Call now" sticker -->
        <g filter="url(#stickerShadow)" transform="translate(470, 0)">
          <rect x="0" y="0" width="260" height="54" rx="27" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
          <circle cx="36" cy="27" r="16" fill="#eff6ff" />
          <text x="36" y="33" font-size="18" text-anchor="middle">🔗</text>
          <text x="65" y="34" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="18" font-weight="bold" fill="#0284c7">
            Call now
          </text>
          <text x="155" y="34" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="17" font-weight="bold" fill="#0f172a">
            اتصل الآن
          </text>
        </g>

        <!-- Main Action Buttons Bar -->
        <g transform="translate(70, 75)">
          <!-- Left: WhatsApp Button -->
          <g filter="url(#cardShadow)">
            <rect x="0" y="0" width="500" height="92" rx="28" fill="url(#waGrad)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
            <circle cx="55" cy="46" r="28" fill="#ffffff" />
            <text x="55" y="55" font-size="28" text-anchor="middle">💬</text>
            <text x="105" y="42" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="23" font-weight="900" fill="#ffffff">
              ${escapeXml(waBtnTitle)}
            </text>
            <text x="105" y="70" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="16" font-weight="600" fill="#dcfce7">
              ${escapeXml(waBtnSub)}
            </text>
          </g>

          <!-- Right: Phone Call Button -->
          <g filter="url(#cardShadow)" transform="translate(530, 0)">
            <rect x="0" y="0" width="530" height="92" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <circle cx="55" cy="46" r="28" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
            <text x="55" y="56" font-size="26" text-anchor="middle">📞</text>
            <text x="105" y="42" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="22" font-weight="900" fill="#0f172a">
              ${escapeXml(callBtnTitle)}
            </text>
            <text x="105" y="72" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="21" font-weight="800" fill="#d97706">
              ${escapeXml(phone)}
            </text>
          </g>
        </g>
      </g>

      <!-- 5. Bottom Hint Bar: Clicking the photo opens the article -->
      <rect x="0" y="585" width="${width}" height="45" fill="rgba(2, 6, 23, 0.94)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
      <text x="600" y="614" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="16" font-weight="bold" fill="#fbbf24" text-anchor="middle">
        ${escapeXml(bottomHint)}
      </text>
    </svg>
  `;

  return basePipeline
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .webp({ quality: 90 })
    .toBuffer();
}
