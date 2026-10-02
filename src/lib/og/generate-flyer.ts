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

export interface FlyerOgOptions {
  title?: string;
  category?: string;
  badgeText?: string;
  footerHint?: string;
  companyName?: string;
  phone?: string;
  whatsapp?: string;
  coverImageUrl?: string;
  locale?: string;
}

export async function generateFlyerOgImage(options: FlyerOgOptions): Promise<Buffer> {
  const {
    companyName = "TENTH POWER GLASS",
    phone = "+966 53 243 8253",
    badgeText = "SPECIAL ARTICLE",
    coverImageUrl,
  } = options;

  const defaultHint =
    badgeText.includes("PROJECT")
      ? "TAP ANYWHERE TO VIEW PROJECT & CONTACT US"
      : badgeText.includes("SERVICE")
      ? "TAP ANYWHERE TO EXPLORE SERVICE & GET QUOTE"
      : badgeText.includes("PORTFOLIO") || badgeText.includes("GALLERY")
      ? "TAP ANYWHERE TO VIEW WORK & CONTACT US"
      : "TAP ANYWHERE TO VIEW DETAILS & CONTACT US";

  const resolvedFooterHint = options.footerHint || defaultHint;

  const width = 1200;
  const height = 630;

  let bgBuffer: Buffer | null = null;

  // 1. Try to load cover image from URL or local path
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

  // 3. Prepare Base Sharp Pipeline (Bright, Crisp, and Vibrant - No Darkening!)
  let basePipeline: any;
  if (bgBuffer) {
    try {
      const processedBg = await sharp(bgBuffer)
        .resize(width, height, { fit: "cover", position: "center" })
        .modulate({ brightness: 1.05, saturation: 1.1 })
        .toBuffer();
      basePipeline = sharp(processedBg);
    } catch {
      basePipeline = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 15, g: 23, b: 42, alpha: 1 },
        },
      });
    }
  } else {
    basePipeline = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 },
      },
    });
  }

  // 4. Vector SVG Overlay with Universal English Fonts (NO TOFU / NO SQUARES on Netlify/Linux)
  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Smooth bottom gradient only - leaves 70% of the image totally bright and unshaded! -->
        <linearGradient id="bottomShade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.0" />
          <stop offset="35%" stop-color="#020617" stop-opacity="0.35" />
          <stop offset="68%" stop-color="#020617" stop-opacity="0.78" />
          <stop offset="100%" stop-color="#020617" stop-opacity="0.96" />
        </linearGradient>

        <!-- Subtle Top Vignette for header badges readability -->
        <linearGradient id="topShade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.0" />
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

        <!-- Card Drop Shadow -->
        <filter id="btnShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.65" />
        </filter>

        <!-- Sticker Shadow -->
        <filter id="stickerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.45" />
        </filter>
      </defs>

      <!-- 1. Top subtle gradient for badges -->
      <rect x="0" y="0" width="${width}" height="120" fill="url(#topShade)" />

      <!-- Golden decorative top accent line -->
      <rect x="0" y="0" width="${width}" height="6" fill="url(#goldGrad)" />

      <!-- 2. Header Badges (English, Universal Fonts) -->
      <g>
        <!-- Company Pill -->
        <rect x="60" y="32" width="290" height="46" rx="23" fill="rgba(15,23,42,0.85)" stroke="rgba(212,175,55,0.6)" stroke-width="1.5" />
        <circle cx="85" cy="55" r="14" fill="#f59e0b" />
        <text x="85" y="61" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">10</text>
        <text x="115" y="62" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" letter-spacing="1">
          ${escapeXml(companyName)}
        </text>

        <!-- Category Tag -->
        <rect x="910" y="32" width="230" height="46" rx="23" fill="rgba(15,23,42,0.85)" stroke="#f59e0b" stroke-width="1.5" />
        <text x="1025" y="61" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="#fef3c7" text-anchor="middle" letter-spacing="1.5">
          ${escapeXml(badgeText)}
        </text>
      </g>

      <!-- 3. Bottom Smooth Gradient (covers only bottom 310px) -->
      <rect x="0" y="320" width="${width}" height="310" fill="url(#bottomShade)" />

      <!-- 4. Interactive CTA Section -->
      <g transform="translate(0, 360)">

        <!-- Center Instagram Story Sticker: [ 🔗 Call now TAP ] -->
        <g filter="url(#stickerShadow)" transform="translate(485, 0)">
          <rect x="0" y="0" width="230" height="54" rx="27" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
          
          <!-- Vector Link Icon -->
          <circle cx="34" cy="27" r="15" fill="#f0f9ff" />
          <g transform="translate(24, 17) scale(0.85)">
            <path fill="#0284c7" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </g>

          <text x="66" y="35" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#0284c7">
            Call now
          </text>
          <text x="160" y="35" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="#64748b">
            TAP
          </text>
        </g>

        <!-- Main Action Buttons Row -->
        <g transform="translate(60, 75)">
          <!-- WhatsApp Button -->
          <g filter="url(#btnShadow)">
            <rect x="0" y="0" width="520" height="92" rx="28" fill="url(#waGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
            <circle cx="55" cy="46" r="28" fill="#ffffff" />
            
            <!-- WhatsApp Vector Icon -->
            <g transform="translate(39, 30) scale(1.35)">
              <path fill="#25D366" d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </g>

            <text x="105" y="43" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#ffffff">
              WhatsApp Chat
            </text>
            <text x="105" y="70" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#dcfce7">
              Instant Engineering Consultation
            </text>
          </g>

          <!-- Call Now Button -->
          <g filter="url(#btnShadow)" transform="translate(560, 0)">
            <rect x="0" y="0" width="520" height="92" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <circle cx="55" cy="46" r="28" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
            
            <!-- Phone Vector Icon -->
            <g transform="translate(42, 33) scale(1.1)">
              <path fill="#d97706" d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </g>

            <text x="105" y="43" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#0f172a">
              Call Now Direct
            </text>
            <text x="105" y="72" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="800" fill="#d97706">
              ${escapeXml(phone)}
            </text>
          </g>
        </g>
      </g>

      <!-- 5. Bottom Hint Bar: Clicking the photo opens the article -->
      <rect x="0" y="585" width="${width}" height="45" fill="rgba(2, 6, 23, 0.95)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
      
      <!-- Hand Pointer Vector Icon & Text -->
      <g transform="translate(325, 597) scale(0.9)">
        <path fill="#fbbf24" d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74a4.5 4.5 0 0 0-9 0c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26A1.5 1.5 0 0 0 13.62 13H13v-5.5a1.5 1.5 0 0 0-3 0V14l-3.12-.65a1.5 1.5 0 0 0-1.42.42l-.76.76 4.7 4.7c.38.38.89.59 1.42.59h6.18c.95 0 1.76-.67 1.94-1.6l.78-4.35a1.5 1.5 0 0 0-.88-1.6z"/>
      </g>
      <text x="620" y="614" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="#fbbf24" text-anchor="middle" letter-spacing="0.5">
        ${escapeXml(resolvedFooterHint)}
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
    .webp({ quality: 92 })
    .toBuffer();
}
