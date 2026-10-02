import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { GalleryPageContent } from "@/components/pages/GalleryPageContent";
import { getGalleryItems, getGalleryAlbums } from "@/lib/actions/content";

export const revalidate = 60;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ item?: string; url?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sParams = searchParams ? await searchParams : {};
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";

  let ogImage = `${appUrl}/api/og/gallery?locale=${locale}`;
  if (sParams.item) {
    ogImage = `${appUrl}/api/og/gallery?id=${encodeURIComponent(sParams.item)}&locale=${locale}`;
  } else if (sParams.url) {
    ogImage = `${appUrl}/api/og/gallery?url=${encodeURIComponent(sParams.url)}&locale=${locale}`;
  }

  const title = dict.gallery.title;
  const description = dict.gallery.subtitle;

  return {
    title,
    description,
    alternates: { canonical: `${appUrl}/${locale}/gallery`, languages: { ar: `${appUrl}/ar/gallery`, en: `${appUrl}/en/gallery` } },
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/webp",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const [albums, { data: galleryItems }] = await Promise.all([
    getGalleryAlbums(validLocale).catch(() => []),
    getGalleryItems().catch(() => ({ data: [] })),
  ]);

  return (
    <GalleryPageContent
      locale={validLocale}
      dict={dict}
      initialAlbums={albums}
      initialItems={galleryItems}
    />
  );
}
