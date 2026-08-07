import fs from "fs";
import path from "path";

/**
 * WebTaky Offline/Fallback JSON Data Provider
 * Loads and parses JSON configuration files stored in public/fallback-data/
 * ensuring that any edit to JSON files reflects on the website without modifying code.
 */

const FALLBACK_DIR = path.join(process.cwd(), "public", "fallback-data");

function readJsonFile<T>(filename: string, defaultData: T): T {
  try {
    const filePath = path.join(FALLBACK_DIR, filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.error(`Error reading fallback JSON file [${filename}]:`, err);
  }
  return defaultData;
}

export function getFallbackCompany() {
  return readJsonFile("company.json", {
    name_ar: "مؤسسة القوة العاشرة للزجاج والألمنيوم والمقاولات",
    name_en: "Tenth Power Glass & Aluminum Contracting",
    description_ar: "تنفيذ أعمال الزجاج السكريت المقوى، الواجهات الزجاجية، قطاعات الألمنيوم والمطابخ العصرية.",
    description_en: "Tempered glass, facades, aluminum profiles and modern kitchen installations.",
    whatsapp_number: "+966500000000",
    phone_primary: "+966500000000",
    phone_secondary: "+966110000000",
    email: "info@webtaky.com",
    website_url: "https://powerof10.netlify.app",
    tax_number: "310000000000003",
    commercial_register: "1010000000",
    logo_url: "/images/defaults/logo.png",
    hero_video_url: "/videos/defaults/hero-bg.mp4",
  });
}

export function getFallbackCities() {
  return readJsonFile<Array<{
    slug: string;
    city_name_ar: string;
    city_name_en: string;
    region_ar: string;
    region_en: string;
    description_ar?: string;
    description_en?: string;
    hero_image_url?: string;
  }>>("cities.json", []);
}

export function getFallbackServices() {
  return readJsonFile<Array<{
    slug: string;
    name_ar: string;
    name_en: string;
    short_description_ar: string;
    short_description_en: string;
    full_description_ar?: string;
    full_description_en?: string;
    price_from?: number;
    price_to?: number;
    price_unit?: string;
    cover_image_url?: string;
    icon?: string;
    features_ar?: string[];
    features_en?: string[];
    is_featured?: boolean;
    sort_order?: number;
  }>>("services.json", []);
}

export function getFallbackProjects() {
  return readJsonFile<Array<{
    slug: string;
    title_ar: string;
    title_en: string;
    description_ar?: string;
    description_en?: string;
    client_name?: string;
    location_ar?: string;
    location_en?: string;
    city?: string;
    project_value?: number;
    cover_image_url?: string;
    before_image_url?: string;
    after_image_url?: string;
    is_featured?: boolean;
  }>>("projects.json", []);
}

export function getFallbackArticles() {
  return readJsonFile<Array<{
    slug: string;
    title_ar: string;
    title_en: string;
    excerpt_ar?: string;
    excerpt_en?: string;
    content_ar?: string;
    content_en?: string;
    cover_image_url?: string;
    read_time_minutes?: number;
    published_at?: string;
  }>>("articles.json", []);
}

export function getFallbackFaqs() {
  return readJsonFile<Array<{
    question_ar: string;
    question_en?: string;
    answer_ar: string;
    answer_en?: string;
  }>>("faqs.json", []);
}

export function getFallbackTestimonials() {
  return readJsonFile<Array<{
    reviewer_name: string;
    client_company?: string;
    rating: number;
    content_ar: string;
    content_en?: string;
    reviewer_avatar_url?: string;
    is_verified?: boolean;
  }>>("testimonials.json", []);
}
