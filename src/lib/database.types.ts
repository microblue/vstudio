// VStudio Database Types
// Auto-generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          cover_image: string | null
          status: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          cover_image?: string | null
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          cover_image?: string | null
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      episodes: {
        Row: {
          id: string
          project_id: string
          episode_number: number
          title: string | null
          status: string
          meta: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          episode_number: number
          title?: string | null
          status?: string
          meta?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          episode_number?: number
          title?: string | null
          status?: string
          meta?: Json
          created_at?: string
          updated_at?: string
        }
      }
      scripts: {
        Row: {
          id: string
          episode_id: string
          content: string
          version: number
          meta: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          content?: string
          version?: number
          meta?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          content?: string
          version?: number
          meta?: Json
          created_at?: string
          updated_at?: string
        }
      }
      characters: {
        Row: {
          id: string
          project_id: string
          asset_id: string
          zh_name: string | null
          en_name: string | null
          gender: string | null
          age: string | null
          appearance: string | null
          costume: string | null
          personality: string | null
          visual_prompts: string[] | null
          color_palette: string[] | null
          reference_image: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          asset_id: string
          zh_name?: string | null
          en_name?: string | null
          gender?: string | null
          age?: string | null
          appearance?: string | null
          costume?: string | null
          personality?: string | null
          visual_prompts?: string[] | null
          color_palette?: string[] | null
          reference_image?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          asset_id?: string
          zh_name?: string | null
          en_name?: string | null
          gender?: string | null
          age?: string | null
          appearance?: string | null
          costume?: string | null
          personality?: string | null
          visual_prompts?: string[] | null
          color_palette?: string[] | null
          reference_image?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          project_id: string
          asset_id: string
          zh_name: string | null
          en_name: string | null
          type: string | null
          atmosphere: string | null
          visual_style: string | null
          color_palette: string[] | null
          key_features: string[] | null
          prompts: string[] | null
          era: string | null
          reference_image: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          asset_id: string
          zh_name?: string | null
          en_name?: string | null
          type?: string | null
          atmosphere?: string | null
          visual_style?: string | null
          color_palette?: string[] | null
          key_features?: string[] | null
          prompts?: string[] | null
          era?: string | null
          reference_image?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          asset_id?: string
          zh_name?: string | null
          en_name?: string | null
          type?: string | null
          atmosphere?: string | null
          visual_style?: string | null
          color_palette?: string[] | null
          key_features?: string[] | null
          prompts?: string[] | null
          era?: string | null
          reference_image?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      props: {
        Row: {
          id: string
          project_id: string
          asset_id: string
          zh_name: string | null
          en_name: string | null
          description: string | null
          visual_prompts: string[] | null
          reference_image: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          asset_id: string
          zh_name?: string | null
          en_name?: string | null
          description?: string | null
          visual_prompts?: string[] | null
          reference_image?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          asset_id?: string
          zh_name?: string | null
          en_name?: string | null
          description?: string | null
          visual_prompts?: string[] | null
          reference_image?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      shots: {
        Row: {
          id: string
          episode_id: string
          shot_id: string
          scene: string | null
          sort_order: number
          duration_s: number
          location_desc: string | null
          location_ref: string | null
          character_refs: string[] | null
          prop_refs: string[] | null
          camera: string | null
          action: string | null
          emotion: string | null
          prompt_visual: string | null
          prompt_motion: string | null
          transition_out: string | null
          transition_duration_s: number | null
          sfx_bgm: string | null
          speed: number | null
          trim_start: number | null
          trim_end: number | null
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          shot_id: string
          scene?: string | null
          sort_order: number
          duration_s?: number
          location_desc?: string | null
          location_ref?: string | null
          character_refs?: string[] | null
          prop_refs?: string[] | null
          camera?: string | null
          action?: string | null
          emotion?: string | null
          prompt_visual?: string | null
          prompt_motion?: string | null
          transition_out?: string | null
          transition_duration_s?: number | null
          sfx_bgm?: string | null
          speed?: number | null
          trim_start?: number | null
          trim_end?: number | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          shot_id?: string
          scene?: string | null
          sort_order?: number
          duration_s?: number
          location_desc?: string | null
          location_ref?: string | null
          character_refs?: string[] | null
          prop_refs?: string[] | null
          camera?: string | null
          action?: string | null
          emotion?: string | null
          prompt_visual?: string | null
          prompt_motion?: string | null
          transition_out?: string | null
          transition_duration_s?: number | null
          sfx_bgm?: string | null
          speed?: number | null
          trim_start?: number | null
          trim_end?: number | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      dialogues: {
        Row: {
          id: string
          shot_id: string
          sort_order: number
          character_name: string | null
          text: string
          emotion: string | null
          speed: number | null
          audio_clip_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          shot_id: string
          sort_order: number
          character_name?: string | null
          text: string
          emotion?: string | null
          speed?: number | null
          audio_clip_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          shot_id?: string
          sort_order?: number
          character_name?: string | null
          text?: string
          emotion?: string | null
          speed?: number | null
          audio_clip_id?: string | null
          created_at?: string
        }
      }
      keyframes: {
        Row: {
          id: string
          shot_id: string | null
          keyframe_id: string
          frame_index: number
          timestamp_s: number
          type: string
          prompt: string | null
          camera_state: string | null
          selected_candidate: number | null
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shot_id?: string | null
          keyframe_id: string
          frame_index: number
          timestamp_s: number
          type?: string
          prompt?: string | null
          camera_state?: string | null
          selected_candidate?: number | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shot_id?: string | null
          keyframe_id?: string
          frame_index?: number
          timestamp_s?: number
          type?: string
          prompt?: string | null
          camera_state?: string | null
          selected_candidate?: number | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      keyframe_candidates: {
        Row: {
          id: string
          keyframe_id: string | null
          candidate_index: number
          image_path: string
          seed: number | null
          is_selected: boolean | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          keyframe_id?: string | null
          candidate_index: number
          image_path: string
          seed?: number | null
          is_selected?: boolean | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          keyframe_id?: string | null
          candidate_index?: number
          image_path?: string
          seed?: number | null
          is_selected?: boolean | null
          metadata?: Json
          created_at?: string
        }
      }
      shot_videos: {
        Row: {
          id: string
          shot_id: string | null
          video_path: string
          seed: number | null
          frames: number | null
          fps: number | null
          is_selected: boolean | null
          status: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          shot_id?: string | null
          video_path: string
          seed?: number | null
          frames?: number | null
          fps?: number | null
          is_selected?: boolean | null
          status?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          shot_id?: string | null
          video_path?: string
          seed?: number | null
          frames?: number | null
          fps?: number | null
          is_selected?: boolean | null
          status?: string
          metadata?: Json
          created_at?: string
        }
      }
      audio_clips: {
        Row: {
          id: string
          episode_id: string
          type: string
          shot_id: string | null
          file_path: string
          duration_s: number | null
          provider: string | null
          voice_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          type: string
          shot_id?: string | null
          file_path: string
          duration_s?: number | null
          provider?: string | null
          voice_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          type?: string
          shot_id?: string | null
          file_path?: string
          duration_s?: number | null
          provider?: string | null
          voice_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      voice_profiles: {
        Row: {
          id: string
          project_id: string
          character_asset_id: string
          provider: string
          voice_id: string | null
          speed: number | null
          reference_audio: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          project_id: string
          character_asset_id: string
          provider: string
          voice_id?: string | null
          speed?: number | null
          reference_audio?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          project_id?: string
          character_asset_id?: string
          provider?: string
          voice_id?: string | null
          speed?: number | null
          reference_audio?: string | null
          metadata?: Json
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          episode_id: string | null
          type: string
          status: string
          provider: string | null
          external_id: string | null
          priority: number | null
          progress: number | null
          params: Json
          result: Json | null
          error: string | null
          retry_count: number | null
          max_retries: number | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          episode_id?: string | null
          type: string
          status?: string
          provider?: string | null
          external_id?: string | null
          priority?: number | null
          progress?: number | null
          params?: Json
          result?: Json | null
          error?: string | null
          retry_count?: number | null
          max_retries?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          episode_id?: string | null
          type?: string
          status?: string
          provider?: string | null
          external_id?: string | null
          priority?: number | null
          progress?: number | null
          params?: Json
          result?: Json | null
          error?: string | null
          retry_count?: number | null
          max_retries?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      screenplay_drafts: {
        Row: {
          id: string
          project_id: string
          version: number
          status: string
          outline: string
          genre: string | null
          target_duration: string | null
          language: string | null
          model: string
          generated_script: string | null
          input_params: Json
          generation_info: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version?: number
          status?: string
          outline: string
          genre?: string | null
          target_duration?: string | null
          language?: string | null
          model: string
          generated_script?: string | null
          input_params?: Json
          generation_info?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          version?: number
          status?: string
          outline?: string
          genre?: string | null
          target_duration?: string | null
          language?: string | null
          model?: string
          generated_script?: string | null
          input_params?: Json
          generation_info?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Project = Database['public']['Tables']['projects']['Row']
export type Episode = Database['public']['Tables']['episodes']['Row']
export type Character = Database['public']['Tables']['characters']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Shot = Database['public']['Tables']['shots']['Row']
export type Dialogue = Database['public']['Tables']['dialogues']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type ScreenplayDraft = Database['public']['Tables']['screenplay_drafts']['Row']