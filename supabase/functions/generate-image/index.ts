// VStudio - 图片生成 Edge Function
// 代理调用 Replicate/fal.ai 图片生成 API，保护 API Key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  num_images?: number;
  seed?: number;
  provider?: 'replicate' | 'fal';
  model?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 验证用户认证
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 解析请求参数
    const body: ImageGenerationRequest = await req.json();
    const { 
      prompt, 
      style = "photorealistic", 
      width = 1024, 
      height = 1024, 
      num_images = 1,
      seed,
      provider = 'replicate',
      model = 'stability-ai/stable-diffusion-3'
    } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let apiResponse;

    if (provider === 'replicate') {
      // Replicate API 调用
      const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: Deno.env.get('REPLICATE_SD_VERSION'), // Stable Diffusion model version
          input: {
            prompt: `${style} style, ${prompt}`,
            width,
            height,
            num_outputs: num_images,
            seed: seed || Math.floor(Math.random() * 1000000),
            guidance_scale: 7.5,
            num_inference_steps: 50,
            scheduler: "DPMSolverMultistep"
          }
        })
      });

      apiResponse = await replicateResponse.json();
      
      if (!replicateResponse.ok) {
        throw new Error(`Replicate API error: ${apiResponse.detail || 'Unknown error'}`);
      }

    } else if (provider === 'fal') {
      // fal.ai API 调用
      const falResponse = await fetch('https://fal.run/fal-ai/stable-diffusion-v3-medium', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${Deno.env.get('FAL_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${style} style, ${prompt}`,
          image_size: `${width}x${height}`,
          num_images,
          seed,
          guidance_scale: 7.5,
          num_inference_steps: 28
        })
      });

      apiResponse = await falResponse.json();

      if (!falResponse.ok) {
        throw new Error(`fal.ai API error: ${apiResponse.detail || 'Unknown error'}`);
      }
    }

    // 记录任务到数据库（可选）
    try {
      await supabase
        .from('tasks')
        .insert({
          type: 'image_generation',
          status: provider === 'replicate' ? 'processing' : 'completed',
          provider,
          external_id: apiResponse.id || null,
          params: body,
          result: apiResponse
        });
    } catch (dbError) {
      console.error('Failed to log task to database:', dbError);
      // 不中断主流程
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider,
        result: apiResponse
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});