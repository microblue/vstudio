export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audio_clips: {
        Row: {
          created_at: string | null
          duration_s: number | null
          episode_id: string
          file_path: string
          id: string
          metadata: Json | null
          provider: string | null
          shot_id: string | null
          type: string
          voice_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_s?: number | null
          episode_id: string
          file_path: string
          id?: string
          metadata?: Json | null
          provider?: string | null
          shot_id?: string | null
          type: string
          voice_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_s?: number | null
          episode_id?: string
          file_path?: string
          id?: string
          metadata?: Json | null
          provider?: string | null
          shot_id?: string | null
          type?: string
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_clips_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_clips_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          age: string | null
          appearance: string | null
          asset_id: string
          color_palette: string[] | null
          costume: string | null
          created_at: string | null
          en_name: string | null
          gender: string | null
          id: string
          metadata: Json | null
          personality: string | null
          project_id: string
          reference_image: string | null
          updated_at: string | null
          visual_prompts: string[] | null
          zh_name: string | null
        }
        Insert: {
          age?: string | null
          appearance?: string | null
          asset_id: string
          color_palette?: string[] | null
          costume?: string | null
          created_at?: string | null
          en_name?: string | null
          gender?: string | null
          id?: string
          metadata?: Json | null
          personality?: string | null
          project_id: string
          reference_image?: string | null
          updated_at?: string | null
          visual_prompts?: string[] | null
          zh_name?: string | null
        }
        Update: {
          age?: string | null
          appearance?: string | null
          asset_id?: string
          color_palette?: string[] | null
          costume?: string | null
          created_at?: string | null
          en_name?: string | null
          gender?: string | null
          id?: string
          metadata?: Json | null
          personality?: string | null
          project_id?: string
          reference_image?: string | null
          updated_at?: string | null
          visual_prompts?: string[] | null
          zh_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dialogues: {
        Row: {
          audio_clip_id: string | null
          character_name: string | null
          created_at: string | null
          emotion: string | null
          id: string
          shot_id: string
          sort_order: number
          speed: number | null
          text: string
        }
        Insert: {
          audio_clip_id?: string | null
          character_name?: string | null
          created_at?: string | null
          emotion?: string | null
          id?: string
          shot_id: string
          sort_order: number
          speed?: number | null
          text: string
        }
        Update: {
          audio_clip_id?: string | null
          character_name?: string | null
          created_at?: string | null
          emotion?: string | null
          id?: string
          shot_id?: string
          sort_order?: number
          speed?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialogues_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dialogues_audio_clip"
            columns: ["audio_clip_id"]
            isOneToOne: false
            referencedRelation: "audio_clips"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string | null
          episode_number: number
          id: string
          meta: Json | null
          project_id: string
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          episode_number: number
          id?: string
          meta?: Json | null
          project_id: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          episode_number?: number
          id?: string
          meta?: Json | null
          project_id?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      keyframe_candidates: {
        Row: {
          candidate_index: number
          created_at: string | null
          id: string
          image_path: string
          is_selected: boolean | null
          keyframe_id: string | null
          metadata: Json | null
          seed: number | null
        }
        Insert: {
          candidate_index: number
          created_at?: string | null
          id?: string
          image_path: string
          is_selected?: boolean | null
          keyframe_id?: string | null
          metadata?: Json | null
          seed?: number | null
        }
        Update: {
          candidate_index?: number
          created_at?: string | null
          id?: string
          image_path?: string
          is_selected?: boolean | null
          keyframe_id?: string | null
          metadata?: Json | null
          seed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyframe_candidates_keyframe_id_fkey"
            columns: ["keyframe_id"]
            isOneToOne: false
            referencedRelation: "keyframes"
            referencedColumns: ["id"]
          },
        ]
      }
      keyframes: {
        Row: {
          camera_state: string | null
          created_at: string | null
          frame_index: number
          id: string
          keyframe_id: string
          metadata: Json | null
          prompt: string | null
          selected_candidate: number | null
          shot_id: string | null
          status: string | null
          timestamp_s: number
          type: string
          updated_at: string | null
        }
        Insert: {
          camera_state?: string | null
          created_at?: string | null
          frame_index: number
          id?: string
          keyframe_id: string
          metadata?: Json | null
          prompt?: string | null
          selected_candidate?: number | null
          shot_id?: string | null
          status?: string | null
          timestamp_s: number
          type?: string
          updated_at?: string | null
        }
        Update: {
          camera_state?: string | null
          created_at?: string | null
          frame_index?: number
          id?: string
          keyframe_id?: string
          metadata?: Json | null
          prompt?: string | null
          selected_candidate?: number | null
          shot_id?: string | null
          status?: string | null
          timestamp_s?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyframes_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          asset_id: string
          atmosphere: string | null
          color_palette: string[] | null
          created_at: string | null
          en_name: string | null
          era: string | null
          id: string
          key_features: string[] | null
          metadata: Json | null
          project_id: string
          prompts: string[] | null
          reference_image: string | null
          type: string | null
          updated_at: string | null
          visual_style: string | null
          zh_name: string | null
        }
        Insert: {
          asset_id: string
          atmosphere?: string | null
          color_palette?: string[] | null
          created_at?: string | null
          en_name?: string | null
          era?: string | null
          id?: string
          key_features?: string[] | null
          metadata?: Json | null
          project_id: string
          prompts?: string[] | null
          reference_image?: string | null
          type?: string | null
          updated_at?: string | null
          visual_style?: string | null
          zh_name?: string | null
        }
        Update: {
          asset_id?: string
          atmosphere?: string | null
          color_palette?: string[] | null
          created_at?: string | null
          en_name?: string | null
          era?: string | null
          id?: string
          key_features?: string[] | null
          metadata?: Json | null
          project_id?: string
          prompts?: string[] | null
          reference_image?: string | null
          type?: string | null
          updated_at?: string | null
          visual_style?: string | null
          zh_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          settings: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      props: {
        Row: {
          asset_id: string
          created_at: string | null
          description: string | null
          en_name: string | null
          id: string
          metadata: Json | null
          project_id: string
          reference_image: string | null
          updated_at: string | null
          visual_prompts: string[] | null
          zh_name: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          description?: string | null
          en_name?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          reference_image?: string | null
          updated_at?: string | null
          visual_prompts?: string[] | null
          zh_name?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          description?: string | null
          en_name?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          reference_image?: string | null
          updated_at?: string | null
          visual_prompts?: string[] | null
          zh_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "props_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      screenplay_drafts: {
        Row: {
          created_at: string | null
          generated_script: string | null
          generation_info: Json | null
          genre: string | null
          id: string
          input_params: Json | null
          language: string | null
          model: string
          outline: string
          project_id: string
          status: string | null
          target_duration: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          generated_script?: string | null
          generation_info?: Json | null
          genre?: string | null
          id?: string
          input_params?: Json | null
          language?: string | null
          model: string
          outline: string
          project_id: string
          status?: string | null
          target_duration?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          generated_script?: string | null
          generation_info?: Json | null
          genre?: string | null
          id?: string
          input_params?: Json | null
          language?: string | null
          model?: string
          outline?: string
          project_id?: string
          status?: string | null
          target_duration?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "screenplay_drafts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          content: string
          created_at: string | null
          episode_id: string
          id: string
          meta: Json | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          episode_id: string
          id?: string
          meta?: Json | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          episode_id?: string
          id?: string
          meta?: Json | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: true
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      shot_videos: {
        Row: {
          created_at: string | null
          fps: number | null
          frames: number | null
          id: string
          is_selected: boolean | null
          metadata: Json | null
          seed: number | null
          shot_id: string | null
          status: string | null
          video_path: string
        }
        Insert: {
          created_at?: string | null
          fps?: number | null
          frames?: number | null
          id?: string
          is_selected?: boolean | null
          metadata?: Json | null
          seed?: number | null
          shot_id?: string | null
          status?: string | null
          video_path: string
        }
        Update: {
          created_at?: string | null
          fps?: number | null
          frames?: number | null
          id?: string
          is_selected?: boolean | null
          metadata?: Json | null
          seed?: number | null
          shot_id?: string | null
          status?: string | null
          video_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "shot_videos_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          action: string | null
          camera: string | null
          character_refs: string[] | null
          created_at: string | null
          duration_s: number
          emotion: string | null
          episode_id: string
          id: string
          location_desc: string | null
          location_ref: string | null
          metadata: Json | null
          notes: string | null
          prompt_motion: string | null
          prompt_visual: string | null
          prop_refs: string[] | null
          scene: string | null
          sfx_bgm: string | null
          shot_id: string
          sort_order: number
          speed: number | null
          transition_duration_s: number | null
          transition_out: string | null
          trim_end: number | null
          trim_start: number | null
          updated_at: string | null
        }
        Insert: {
          action?: string | null
          camera?: string | null
          character_refs?: string[] | null
          created_at?: string | null
          duration_s?: number
          emotion?: string | null
          episode_id: string
          id?: string
          location_desc?: string | null
          location_ref?: string | null
          metadata?: Json | null
          notes?: string | null
          prompt_motion?: string | null
          prompt_visual?: string | null
          prop_refs?: string[] | null
          scene?: string | null
          sfx_bgm?: string | null
          shot_id: string
          sort_order: number
          speed?: number | null
          transition_duration_s?: number | null
          transition_out?: string | null
          trim_end?: number | null
          trim_start?: number | null
          updated_at?: string | null
        }
        Update: {
          action?: string | null
          camera?: string | null
          character_refs?: string[] | null
          created_at?: string | null
          duration_s?: number
          emotion?: string | null
          episode_id?: string
          id?: string
          location_desc?: string | null
          location_ref?: string | null
          metadata?: Json | null
          notes?: string | null
          prompt_motion?: string | null
          prompt_visual?: string | null
          prop_refs?: string[] | null
          scene?: string | null
          sfx_bgm?: string | null
          shot_id?: string
          sort_order?: number
          speed?: number | null
          transition_duration_s?: number | null
          transition_out?: string | null
          trim_end?: number | null
          trim_start?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shots_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          episode_id: string | null
          error: string | null
          external_id: string | null
          id: string
          max_retries: number | null
          params: Json
          priority: number | null
          progress: number | null
          project_id: string
          provider: string | null
          result: Json | null
          retry_count: number | null
          started_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          episode_id?: string | null
          error?: string | null
          external_id?: string | null
          id?: string
          max_retries?: number | null
          params?: Json
          priority?: number | null
          progress?: number | null
          project_id: string
          provider?: string | null
          result?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          episode_id?: string | null
          error?: string | null
          external_id?: string | null
          id?: string
          max_retries?: number | null
          params?: Json
          priority?: number | null
          progress?: number | null
          project_id?: string
          provider?: string | null
          result?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_profiles: {
        Row: {
          character_asset_id: string
          id: string
          metadata: Json | null
          project_id: string
          provider: string
          reference_audio: string | null
          speed: number | null
          voice_id: string | null
        }
        Insert: {
          character_asset_id: string
          id?: string
          metadata?: Json | null
          project_id: string
          provider: string
          reference_audio?: string | null
          speed?: number | null
          voice_id?: string | null
        }
        Update: {
          character_asset_id?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          provider?: string
          reference_audio?: string | null
          speed?: number | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

