/**
 * Database type definitions for Supabase.
 * These types represent the complete PostgreSQL schema.
 * 
 * In production, these should be auto-generated via:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 * 
 * This file provides the initial type definitions matching our migration schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string;
          slug: string;
          description_ar: string | null;
          description_en: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          primary_color: string;
          secondary_color: string;
          accent_color: string;
          whatsapp_number: string | null;
          phone_primary: string | null;
          phone_secondary: string | null;
          email: string | null;
          website_url: string | null;
          google_maps_embed: string | null;
          latitude: number | null;
          longitude: number | null;
          tax_number: string | null;
          commercial_register: string | null;
          maintenance_mode: boolean;
          maintenance_message: string | null;
          social_links: Json | null;
          theme_config: Json | null;
          default_locale: string;
          supported_locales: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["companies"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };

      categories: {
        Row: {
          id: string;
          company_id: string;
          parent_id: string | null;
          name_ar: string;
          name_en: string;
          slug: string;
          description_ar: string | null;
          description_en: string | null;
          icon: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at" | "sort_order"> & {
          id?: string;
          created_at?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };

      services: {
        Row: {
          id: string;
          company_id: string;
          category_id: string | null;
          name_ar: string;
          name_en: string;
          slug: string;
          short_description_ar: string | null;
          short_description_en: string | null;
          full_description_ar: string | null;
          full_description_en: string | null;
          cover_image_url: string | null;
          icon: string | null;
          features_ar: string[] | null;
          features_en: string[] | null;
          price_from: number | null;
          price_to: number | null;
          price_unit: string | null;
          show_price: boolean;
          sort_order: number;
          is_featured: boolean;
          is_active: boolean;
          view_count: number;
          seo_keywords_ar: Json | null;
          seo_keywords_en: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at" | "updated_at" | "view_count" | "sort_order"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };

      projects: {
        Row: {
          id: string;
          company_id: string;
          service_id: string | null;
          title_ar: string;
          title_en: string;
          slug: string;
          description_ar: string | null;
          description_en: string | null;
          client_name: string | null;
          location_ar: string | null;
          location_en: string | null;
          city: string | null;
          project_value: number | null;
          start_date: string | null;
          end_date: string | null;
          status: string;
          is_featured: boolean;
          is_active: boolean;
          view_count: number;
          specifications: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "view_count"> & {
          id?: string;
          created_at?: string;
          view_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };

      articles: {
        Row: {
          id: string;
          company_id: string;
          author_id: string | null;
          title_ar: string;
          title_en: string;
          slug: string;
          excerpt_ar: string | null;
          excerpt_en: string | null;
          content_ar: string | null;
          content_en: string | null;
          cover_image_url: string | null;
          status: string;
          is_featured: boolean;
          view_count: number;
          read_time_minutes: number;
          related_service_ids: string[] | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["articles"]["Row"], "id" | "created_at" | "updated_at" | "view_count" | "read_time_minutes"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          read_time_minutes?: number;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
      };

      testimonials: {
        Row: {
          id: string;
          company_id: string;
          service_id: string | null;
          client_name: string;
          client_title: string | null;
          client_company: string | null;
          client_avatar_url: string | null;
          content_ar: string;
          content_en: string | null;
          rating: number;
          is_featured: boolean;
          is_approved: boolean;
          source: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["testimonials"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
      };

      faqs: {
        Row: {
          id: string;
          company_id: string;
          service_id: string | null;
          question_ar: string;
          question_en: string | null;
          answer_ar: string;
          answer_en: string | null;
          sort_order: number;
          is_active: boolean;
          page_context: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["faqs"]["Row"], "id" | "created_at" | "sort_order"> & {
          id?: string;
          created_at?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["faqs"]["Insert"]>;
      };

      media_library: {
        Row: {
          id: string;
          company_id: string;
          file_name: string;
          original_name: string;
          file_url: string;
          cdn_url: string | null;
          thumbnail_url: string | null;
          webp_url: string | null;
          avif_url: string | null;
          blur_hash: string | null;
          mime_type: string;
          file_size: number;
          width: number | null;
          height: number | null;
          storage_provider: string;
          storage_path: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["media_library"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media_library"]["Insert"]>;
      };

      media_metadata: {
        Row: {
          id: string;
          media_id: string;
          title_ar: string | null;
          title_en: string | null;
          alt_ar: string | null;
          alt_en: string | null;
          caption_ar: string | null;
          caption_en: string | null;
          description_ar: string | null;
          description_en: string | null;
          keywords: string[] | null;
          location: string | null;
          author: string | null;
          copyright: string | null;
          exif_data: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["media_metadata"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media_metadata"]["Insert"]>;
      };

      seo_metadata: {
        Row: {
          id: string;
          company_id: string;
          entity_type: string;
          entity_id: string;
          locale: string;
          meta_title: string | null;
          meta_description: string | null;
          meta_keywords: string[] | null;
          canonical_url: string | null;
          og_title: string | null;
          og_description: string | null;
          og_image_url: string | null;
          og_type: string | null;
          twitter_card: string | null;
          twitter_title: string | null;
          twitter_description: string | null;
          twitter_image_url: string | null;
          structured_data: Json | null;
          robots: string | null;
          hreflang_urls: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["seo_metadata"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seo_metadata"]["Insert"]>;
      };

      city_pages: {
        Row: {
          id: string;
          company_id: string;
          city_name_ar: string;
          city_name_en: string;
          slug: string;
          description_ar: string | null;
          description_en: string | null;
          hero_image_url: string | null;
          latitude: number | null;
          longitude: number | null;
          region_ar: string | null;
          region_en: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["city_pages"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["city_pages"]["Insert"]>;
      };

      city_services: {
        Row: {
          id: string;
          city_page_id: string;
          service_id: string;
          unique_content_ar: string | null;
          unique_content_en: string | null;
          local_keywords_ar: string[] | null;
          local_keywords_en: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["city_services"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["city_services"]["Insert"]>;
      };

      users: {
        Row: {
          id: string;
          company_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          whatsapp: string | null;
          city: string | null;
          source: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };

      appointments: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          service_id: string | null;
          status: string;
          preferred_date: string | null;
          preferred_time: string | null;
          notes: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
      };

      quote_requests: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          service_id: string | null;
          description: string | null;
          budget_range: string | null;
          city: string | null;
          urgency: string | null;
          ai_conversation: Json | null;
          status: string;
          assigned_to: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quote_requests"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quote_requests"]["Insert"]>;
      };

      messages: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          subject: string | null;
          content: string;
          type: string;
          is_read: boolean;
          reply: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at" | "is_read"> & {
          id?: string;
          created_at?: string;
          is_read?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };

      chat_sessions: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          status: string;
          message_count: number;
          context: Json | null;
          created_at: string;
          ended_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_sessions"]["Row"], "id" | "created_at" | "message_count"> & {
          id?: string;
          created_at?: string;
          message_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["chat_sessions"]["Insert"]>;
      };

      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: string;
          content: string;
          suggested_actions: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_messages"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
      };

      ai_prompts: {
        Row: {
          id: string;
          company_id: string;
          prompt_type: string;
          system_prompt_ar: string | null;
          system_prompt_en: string | null;
          model: string;
          temperature: number;
          max_tokens: number;
          context_data: Json | null;
          is_active: boolean;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_prompts"]["Row"], "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_prompts"]["Insert"]>;
      };

      company_settings: {
        Row: {
          id: string;
          company_id: string;
          key: string;
          value: Json;
          category: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["company_settings"]["Row"], "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["company_settings"]["Insert"]>;
      };

      company_contacts: {
        Row: {
          id: string;
          company_id: string;
          type: string;
          value: string;
          label_ar: string | null;
          label_en: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["company_contacts"]["Row"], "id" | "created_at" | "sort_order"> & {
          id?: string;
          created_at?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["company_contacts"]["Insert"]>;
      };

      business_hours: {
        Row: {
          id: string;
          company_id: string;
          day_of_week: number;
          open_time: string | null;
          close_time: string | null;
          is_closed: boolean;
          note_ar: string | null;
          note_en: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["business_hours"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_hours"]["Insert"]>;
      };

      company_addresses: {
        Row: {
          id: string;
          company_id: string;
          label_ar: string | null;
          label_en: string | null;
          street_ar: string | null;
          street_en: string | null;
          city_ar: string | null;
          city_en: string | null;
          region_ar: string | null;
          region_en: string | null;
          postal_code: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          google_maps_url: string | null;
          is_primary: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["company_addresses"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["company_addresses"]["Insert"]>;
      };

      push_subscriptions: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          endpoint: string;
          p256dh: string;
          auth: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["push_subscriptions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_subscriptions"]["Insert"]>;
      };

      analytics_events: {
        Row: {
          id: string;
          company_id: string;
          event_type: string;
          page_path: string | null;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          device_type: string | null;
          browser: string | null;
          country: string | null;
          city: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_events"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
      };

      gallery_albums: {
        Row: {
          id: string;
          company_id: string;
          title_ar: string;
          title_en: string | null;
          slug: string;
          description_ar: string | null;
          description_en: string | null;
          cover_image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gallery_albums"]["Row"], "id" | "created_at" | "sort_order"> & {
          id?: string;
          created_at?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_albums"]["Insert"]>;
      };

      gallery_items: {
        Row: {
          id: string;
          album_id: string;
          media_id: string;
          type: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gallery_items"]["Row"], "id" | "created_at" | "sort_order"> & {
          id?: string;
          created_at?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_items"]["Insert"]>;
      };

      project_images: {
        Row: {
          id: string;
          project_id: string;
          media_id: string;
          sort_order: number;
          is_cover: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["project_images"]["Row"], "id" | "sort_order" | "is_cover"> & {
          id?: string;
          sort_order?: number;
          is_cover?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["project_images"]["Insert"]>;
      };

      project_videos: {
        Row: {
          id: string;
          project_id: string;
          video_url: string;
          thumbnail_url: string | null;
          title_ar: string | null;
          title_en: string | null;
          duration_seconds: number | null;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["project_videos"]["Row"], "id" | "sort_order"> & {
          id?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["project_videos"]["Insert"]>;
      };

      project_before_after: {
        Row: {
          id: string;
          project_id: string;
          before_image_id: string;
          after_image_id: string;
          caption_ar: string | null;
          caption_en: string | null;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["project_before_after"]["Row"], "id" | "sort_order"> & {
          id?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["project_before_after"]["Insert"]>;
      };

      service_images: {
        Row: {
          id: string;
          service_id: string;
          media_id: string;
          sort_order: number;
          is_cover: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["service_images"]["Row"], "id" | "sort_order" | "is_cover"> & {
          id?: string;
          sort_order?: number;
          is_cover?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["service_images"]["Insert"]>;
      };

      article_tags: {
        Row: {
          id: string;
          article_id: string;
          tag_ar: string;
          tag_en: string | null;
          slug: string;
        };
        Insert: Omit<Database["public"]["Tables"]["article_tags"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["article_tags"]["Insert"]>;
      };

      notification_log: {
        Row: {
          id: string;
          company_id: string;
          type: string;
          title_ar: string | null;
          title_en: string | null;
          body_ar: string | null;
          body_en: string | null;
          target_audience: string | null;
          sent_count: number;
          delivered_count: number;
          sent_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notification_log"]["Row"], "id" | "sent_at" | "sent_count" | "delivered_count"> & {
          id?: string;
          sent_at?: string;
          sent_count?: number;
          delivered_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["notification_log"]["Insert"]>;
      };

      audit_log: {
        Row: {
          id: string;
          company_id: string;
          actor_type: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_log"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never; // Audit logs are immutable
      };

      telegram_admins: {
        Row: {
          id: string;
          company_id: string;
          telegram_user_id: number;
          telegram_username: string | null;
          role: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["telegram_admins"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["telegram_admins"]["Insert"]>;
      };

      backups: {
        Row: {
          id: string;
          company_id: string;
          backup_url: string | null;
          type: string;
          size_bytes: number | null;
          status: string;
          triggered_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["backups"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["backups"]["Insert"]>;
      };

      search_index: {
        Row: {
          id: string;
          company_id: string;
          entity_type: string;
          entity_id: string;
          locale: string;
          search_vector: unknown; // tsvector type
          title: string;
          content_preview: string | null;
          url_path: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["search_index"]["Row"], "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["search_index"]["Insert"]>;
      };

      customer_reviews: {
        Row: {
          id: string;
          company_id: string;
          service_id: string | null;
          project_id: string | null;
          reviewer_name: string;
          reviewer_email: string | null;
          reviewer_phone: string | null;
          rating: number;
          title_ar: string | null;
          title_en: string | null;
          content_ar: string | null;
          content_en: string | null;
          image_urls: string[] | null;
          is_verified: boolean;
          is_approved: boolean;
          response_ar: string | null;
          response_en: string | null;
          response_date: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customer_reviews"]["Row"], "id" | "created_at" | "is_verified" | "is_approved"> & {
          id?: string;
          created_at?: string;
          is_verified?: boolean;
          is_approved?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["customer_reviews"]["Insert"]>;
      };

      article_images: {
        Row: {
          id: string;
          article_id: string;
          media_id: string;
          context: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["article_images"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["article_images"]["Insert"]>;
      };
    };

    Views: Record<string, never>;
    
    Functions: {
      search_content: {
        Args: {
          search_query: string;
          search_locale: string;
          search_company_id: string;
          result_limit?: number;
        };
        Returns: {
          entity_type: string;
          entity_id: string;
          title: string;
          content_preview: string | null;
          url_path: string;
          rank: number;
        }[];
      };
    };

    Enums: Record<string, never>;
  };
}

/** Convenience type aliases */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
