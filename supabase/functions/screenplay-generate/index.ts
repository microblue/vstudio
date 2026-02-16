// VStudio - 剧本生成 Edge Function
// 调用 LLM API 生成专业剧本，支持多种模型和流式输出

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScreenplayRequest {
  project_id: string;
  outline: string;
  genre?: string;
  target_duration?: string;
  language?: 'zh' | 'en';
  model?: 'claude-sonnet' | 'claude-opus' | 'gpt-4o' | 'deepseek-r1' | 'custom';
  custom_model?: string;
  stream?: boolean;
  additional_requirements?: string;
}

const SCREENPLAY_PROMPTS = {
  system: `你是一位专业的剧本创作专家，擅长创作短视频剧本。你需要根据用户提供的故事大纲创作一个完整的剧本。

剧本格式要求：
1. 使用标准的分场分镜格式
2. 每个Scene包含多个Shot
3. 每个Shot包含：镜头描述、时长、场景、角色、对话、动作、情感
4. 使用Markdown格式输出
5. 适合AI视频生成的详细视觉描述

剧本结构示例：
# [剧本标题]

## Scene 1: [场景名称]
**时间**: [具体时间]
**地点**: [详细地点描述]

### Shot 1
- **镜头**: [镜头类型和拍摄角度]
- **时长**: [秒数]
- **描述**: [详细的视觉描述，包含环境、光线、构图]
- **角色**: [出现的角色]
- **对话**: 
  - 角色名："对话内容"
- **动作**: [角色的具体动作]
- **情感**: [角色情感状态]

请确保：
- 剧本适合指定的时长
- 视觉描述详细，便于AI生成
- 对话自然，符合角色设定
- 情节流畅，有起承转合
- 镜头语言丰富，有视觉冲击力`,

  user: (outline: string, genre: string, duration: string, requirements: string) => 
    `请根据以下信息创作一个完整的短视频剧本：

**故事大纲**：${outline}

**类型**：${genre}
**目标时长**：${duration}

**额外要求**：${requirements || '无特殊要求'}

请创作一个完整的剧本，确保：
1. 故事完整有趣
2. 适合视频制作
3. 镜头描述详细
4. 时长控制准确
5. 角色鲜明生动`
};

async function callLLMAPI(model: string, messages: any[], stream: boolean = false) {
  switch (model) {
    case 'claude-sonnet':
    case 'claude-opus':
      return await callAnthropicAPI(model, messages, stream);
    case 'gpt-4o':
      return await callOpenAIAPI(model, messages, stream);
    case 'deepseek-r1':
      return await callDeepSeekAPI(messages, stream);
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

async function callAnthropicAPI(model: string, messages: any[], stream: boolean) {
  const anthropicModel = model === 'claude-opus' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022';
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: 4000,
      messages,
      stream
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  return response;
}

async function callOpenAIAPI(model: string, messages: any[], stream: boolean) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: 4000,
      stream
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  return response;
}

async function callDeepSeekAPI(messages: any[], stream: boolean) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'deepseek-reasoner',
      messages,
      max_tokens: 4000,
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

    const body: ScreenplayRequest = await req.json();
    const { 
      project_id,
      outline, 
      genre = '短剧',
      target_duration = '5-8分钟',
      language = 'zh',
      model = 'claude-sonnet',
      stream = false,
      additional_requirements = ''
    } = body;

    if (!outline || !project_id) {
      return new Response(
        JSON.stringify({ error: 'project_id and outline are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 创建剧本草稿记录
    const { data: draft, error: draftError } = await supabase
      .from('screenplay_drafts')
      .insert({
        project_id,
        status: 'generating',
        outline,
        genre,
        target_duration,
        language,
        model,
        input_params: {
          additional_requirements,
          stream
        }
      })
      .select('id')
      .single();

    if (draftError) {
      throw new Error(`Failed to create screenplay draft: ${draftError.message}`);
    }

    // 准备LLM消息
    const messages = [
      { role: 'system', content: SCREENPLAY_PROMPTS.system },
      { role: 'user', content: SCREENPLAY_PROMPTS.user(outline, genre, target_duration, additional_requirements) }
    ];

    // 调用LLM API
    const llmResponse = await callLLMAPI(model, messages, stream);

    if (stream) {
      // 流式响应
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const reader = llmResponse.body?.getReader();
          let fullScript = '';

          try {
            while (reader) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    let content = '';
                    
                    if (model.startsWith('claude')) {
                      content = parsed.delta?.text || '';
                    } else if (model === 'gpt-4o') {
                      content = parsed.choices?.[0]?.delta?.content || '';
                    } else if (model === 'deepseek-r1') {
                      content = parsed.choices?.[0]?.delta?.content || '';
                    }

                    if (content) {
                      fullScript += content;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content, draft_id: draft.id })}\n\n`));
                    }
                  } catch (e) {
                    console.error('Failed to parse streaming data:', e);
                  }
                }
              }
            }

            // 更新数据库
            await supabase
              .from('screenplay_drafts')
              .update({
                status: 'completed',
                generated_script: fullScript,
                generation_info: { model, completed_at: new Date().toISOString() }
              })
              .eq('id', draft.id);

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, draft_id: draft.id })}\n\n`));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            
            // 更新状态为失败
            await supabase
              .from('screenplay_drafts')
              .update({
                status: 'failed',
                generation_info: { error: error.message }
              })
              .eq('id', draft.id);

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });

    } else {
      // 非流式响应
      const result = await llmResponse.json();
      let generatedScript = '';

      if (model.startsWith('claude')) {
        generatedScript = result.content[0].text;
      } else if (model === 'gpt-4o') {
        generatedScript = result.choices[0].message.content;
      } else if (model === 'deepseek-r1') {
        generatedScript = result.choices[0].message.content;
      }

      // 更新数据库
      await supabase
        .from('screenplay_drafts')
        .update({
          status: 'completed',
          generated_script: generatedScript,
          generation_info: { model, tokens: result.usage }
        })
        .eq('id', draft.id);

      return new Response(
        JSON.stringify({
          success: true,
          draft_id: draft.id,
          script: generatedScript,
          model,
          usage: result.usage
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Screenplay generation error:', error);
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