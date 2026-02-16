// VStudio - LLM 通用代理 Edge Function
// 为各种 LLM 调用提供统一代理，保护 API Key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LLMRequest {
  provider: 'anthropic' | 'openai' | 'deepseek';
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  system?: string;
}

async function callAnthropicAPI(request: LLMRequest) {
  const { model, messages, max_tokens = 2000, temperature = 0.7, stream = false, system } = request;
  
  const body: any = {
    model,
    max_tokens,
    temperature,
    messages,
    stream
  };

  if (system) {
    body.system = system;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  return response;
}

async function callOpenAIAPI(request: LLMRequest) {
  const { model, messages, max_tokens = 2000, temperature = 0.7, stream = false } = request;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature,
      stream
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  return response;
}

async function callDeepSeekAPI(request: LLMRequest) {
  const { model, messages, max_tokens = 2000, temperature = 0.7, stream = false } = request;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature,
      stream
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DeepSeek API error: ${error.error?.message || 'Unknown error'}`);
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

    const request: LLMRequest = await req.json();
    const { provider, messages } = request;

    if (!provider || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'provider and messages are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let apiResponse;
    
    switch (provider) {
      case 'anthropic':
        apiResponse = await callAnthropicAPI(request);
        break;
      case 'openai':
        apiResponse = await callOpenAIAPI(request);
        break;
      case 'deepseek':
        apiResponse = await callDeepSeekAPI(request);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    if (request.stream) {
      // 流式响应直接代理
      return new Response(apiResponse.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      // 非流式响应
      const result = await apiResponse.json();
      return new Response(
        JSON.stringify(result),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('LLM proxy error:', error);
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