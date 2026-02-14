// Auto-generated types placeholder — regenerate with: supabase gen types typescript --local
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			projects: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					description: string | null;
					cover_image: string | null;
					status: string;
					settings: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id?: string;
					name: string;
					description?: string | null;
					cover_image?: string | null;
					status?: string;
					settings?: Json;
				};
				Update: Partial<Database['public']['Tables']['projects']['Insert']>;
			};
			episodes: {
				Row: {
					id: string;
					project_id: string;
					episode_number: number;
					title: string | null;
					status: string;
					meta: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					project_id: string;
					episode_number: number;
					title?: string | null;
					status?: string;
					meta?: Json;
				};
				Update: Partial<Database['public']['Tables']['episodes']['Insert']>;
			};
			scripts: {
				Row: {
					id: string;
					episode_id: string;
					content: string;
					version: number;
					meta: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					episode_id: string;
					content: string;
					version?: number;
					meta?: Json;
				};
				Update: Partial<Database['public']['Tables']['scripts']['Insert']>;
			};
			characters: {
				Row: {
					id: string;
					project_id: string;
					asset_id: string;
					zh_name: string | null;
					en_name: string | null;
					gender: string | null;
					age: string | null;
					appearance: string | null;
					costume: string | null;
					personality: string | null;
					visual_prompts: string[] | null;
					color_palette: string[] | null;
					reference_image: string | null;
					metadata: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					project_id: string;
					asset_id: string;
					zh_name?: string | null;
					en_name?: string | null;
					gender?: string | null;
					age?: string | null;
					appearance?: string | null;
					costume?: string | null;
					personality?: string | null;
					visual_prompts?: string[] | null;
					color_palette?: string[] | null;
					reference_image?: string | null;
					metadata?: Json;
				};
				Update: Partial<Database['public']['Tables']['characters']['Insert']>;
			};
			locations: {
				Row: {
					id: string;
					project_id: string;
					asset_id: string;
					zh_name: string | null;
					en_name: string | null;
					type: string | null;
					atmosphere: string | null;
					visual_style: string | null;
					color_palette: string[] | null;
					key_features: string[] | null;
					prompts: string[] | null;
					era: string | null;
					reference_image: string | null;
					metadata: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					project_id: string;
					asset_id: string;
					zh_name?: string | null;
					en_name?: string | null;
					[key: string]: unknown;
				};
				Update: Partial<Database['public']['Tables']['locations']['Insert']>;
			};
			props: {
				Row: {
					id: string;
					project_id: string;
					asset_id: string;
					zh_name: string | null;
					en_name: string | null;
					description: string | null;
					visual_prompts: string[] | null;
					reference_image: string | null;
					metadata: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					project_id: string;
					asset_id: string;
					[key: string]: unknown;
				};
				Update: Partial<Database['public']['Tables']['props']['Insert']>;
			};
			shots: {
				Row: {
					id: string;
					episode_id: string;
					shot_id: string;
					scene: string | null;
					sort_order: number;
					duration_s: number;
					location_desc: string | null;
					location_ref: string | null;
					character_refs: string[] | null;
					prop_refs: string[] | null;
					camera: string | null;
					action: string | null;
					emotion: string | null;
					prompt_visual: string | null;
					prompt_motion: string | null;
					transition_out: string;
					transition_duration_s: number;
					sfx_bgm: string | null;
					speed: number;
					trim_start: number;
					trim_end: number | null;
					notes: string | null;
					metadata: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					episode_id: string;
					shot_id: string;
					sort_order: number;
					[key: string]: unknown;
				};
				Update: Partial<Database['public']['Tables']['shots']['Insert']>;
			};
			tasks: {
				Row: {
					id: string;
					project_id: string;
					episode_id: string | null;
					type: string;
					status: string;
					provider: string | null;
					external_id: string | null;
					priority: number;
					progress: number;
					params: Json;
					result: Json | null;
					error: string | null;
					retry_count: number;
					max_retries: number;
					started_at: string | null;
					completed_at: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					project_id: string;
					type: string;
					params: Json;
					[key: string]: unknown;
				};
				Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
			};
			screenplay_drafts: {
				Row: {
					id: string;
					project_id: string;
					version: number;
					status: string;
					outline: string;
					genre: string | null;
					target_duration: string | null;
					language: string;
					model: string;
					generated_script: string | null;
					input_params: Json;
					generation_info: Json;
					created_at: string;
				};
				Insert: {
					id?: string;
					project_id: string;
					outline: string;
					model: string;
					[key: string]: unknown;
				};
				Update: Partial<Database['public']['Tables']['screenplay_drafts']['Insert']>;
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}
