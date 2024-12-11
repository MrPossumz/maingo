import type { ResponseJson } from "@/types.ts";
import Library from "@/library.ts";

type ImageData = {
  id: number;
  created_at: string;
  updated_at: string;
  uploader_id: number;
  score: number;
  source: string;
  md5: string;
  last_comment_bumped_at: null;
  rating: string;
  image_width: number;
  image_height: number;
  tag_string: string;
  fav_count: number;
  file_ext: string;
  last_noted_at: null;
  parent_id: null;
  has_children: boolean;
  approved_id: null;
  tag_count_general: number;
  tag_count_artist: number;
  tag_count_character: number;
  tag_count_copyright: number;
  file_size: number;
  up_score: number;
  down_score: number;
  is_pending: boolean;
  is_flagged: boolean;
  is_deleted: boolean;
  tag_count: number;
  is_banned: boolean;
  pixiv_id: null;
  last_commented_at: null;
  has_active_children: boolean;
  bit_flats: number;
  tag_count_meta: number;
  has_large: boolean;
  has_visible_children: boolean;
  media_asset: {
    id: number;
    created_at: string;
    updated_at: string;
    md5: string;
    file_ext: string;
    file_size: number;
    image_width: number;
    image_height: number;
    duration: null;
    status: string;
    file_key: string;
    is_public: boolean;
    pixel_hash: string;
    variants: {
      type: `${number}x${number}`;
      url: string;
      width: number;
      height: number;
      file_ext: string;
    }[];
  };
  tag_string_general: string;
  tag_string_character: string;
  tag_string_copyright: string;
  tag_string_artist: string;
  tag_string_meta: string;
  file_url: string;
  large_file_url: string;
  preview_file_url: string;
};

export const Danbooru = Library<{
  [x: `/posts/${number}.json`]: {
    get: {
      response: ImageData;
    };
  };
  "/posts.json": {
    get: {
      request: {
        params: { tag_id?: string | number };
      };
      response: ImageData[];
    };
  };
  /** Search tags */
  "/tags.json": {
    get: {
      request: {
        params: {
          name_match?: string;
          rating?: string;
          tag_string?: string;
        };
      };
      response: ResponseJson<{
        id: number;
        name: string;
        post_count: number;
        category: number;
        created_at: string;
        updated_at: string;
        is_deperecated: boolean;
        words: string[];
      }[]>;
    };
  };
}>()({
  connector: "REST" as const,
  hostname: "https://danbooru.donmai.us",
  auth: "none" as const,
});
