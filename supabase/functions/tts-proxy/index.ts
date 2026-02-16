// VStudio - TTS 代理 Edge Function  
// 调用 Fish Audio 等 TTS 服务生成语音

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TTSRequest {
  text: string;
  voice_id: string;
  provider?: 'fish_audio' | 'elevenlabs';
  speed?: number;
  pitch?: number;
  language?: 'zh' | 'en';
  format?: 'wav' | 'mp3';
}

async function callFishAudioAPI(request: TTSRequest) {
  const { text, voice_id, speed = 1.0, pitch = 0, language = 'zh', format = 'wav' } = request;

  const response = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('FISH_AUDIO_API_KEY')}`,
    },
    body: JSON.stringify({
      text,
      reference_id: voice_id,
      speed,
      pitch,
      language,
      format,
      normalize: true,
      mp3_bitrate: 128
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Fish Audio API error: ${error.detail || 'Unknown error'}`);
  }

  return response;
}

async function callElevenLabsAPI(request: TTSRequest) {
  const { text, voice_id, speed = 1.0 } = request;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
    },
    body: JSON.stringify({
      text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        speed: speed
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ElevenLabs API error: ${error.detail?.message || 'Unknown error'}`);
  }

  return response;
}

serve(async (req) => {
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

    const request: TTSRequest = await req.json();
    const { text, voice_id, provider = 'fish_audio' } = request;

    if (!text || !voice_id) {
      return new Response(
        JSON.stringify({ error: 'text and voice_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let apiResponse;

    switch (provider) {
      case 'fish_audio':
        apiResponse = await callFishAudioAPI(request);
        break;
      case 'elevenlabs':
        apiResponse = await callElevenLabsAPI(request);
        break;
      default:
        throw new Error(`Unsupported TTS provider: ${provider}`);
    }

    // 如果是Fish Audio，可能返回JSON带音频URL
    if (provider === 'fish_audio') {
      const contentType = apiResponse.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // 返回任务ID或URL
        const result = await apiResponse.json();
        return new Response(
          JSON.stringify({
            success: true,
            provider,
            result
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // 直接返回音频文件
    const audioBuffer = await apiResponse.arrayBuffer();
    
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': provider === 'fish_audio' ? 'audio/wav' : 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      }
    });

  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});