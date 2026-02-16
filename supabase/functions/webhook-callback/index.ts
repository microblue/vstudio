// VStudio - Webhook 回调处理 Edge Function
// 接收 AI 服务的异步任务完成通知，更新数据库并推送前端

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: any;
  error?: string;
  logs?: string[];
  metrics?: {
    predict_time?: number;
    total_time?: number;
  };
  created_at?: string;
  completed_at?: string;
  urls?: {
    get: string;
    cancel: string;
  };
}

async function handleReplicateWebhook(payload: WebhookPayload, supabase: any) {
  const { id, status, output, error, metrics, completed_at } = payload;

  // 根据 external_id 查找对应的任务
  const { data: tasks, error: queryError } = await supabase
    .from('tasks')
    .select('*')
    .eq('external_id', id);

  if (queryError) {
    console.error('Failed to query task:', queryError);
    throw queryError;
  }

  if (!tasks || tasks.length === 0) {
    console.warn(`No task found for external_id: ${id}`);
    return { success: false, message: 'Task not found' };
  }

  const task = tasks[0];
  let updateData: any = {
    status: status === 'succeeded' ? 'completed' : status === 'failed' ? 'failed' : 'processing',
    updated_at: new Date().toISOString()
  };

  if (status === 'succeeded' && output) {
    updateData.result = output;
    updateData.completed_at = completed_at || new Date().toISOString();
    updateData.progress = 100;
  } else if (status === 'failed' && error) {
    updateData.error = error;
    updateData.completed_at = completed_at || new Date().toISOString();
  }

  if (metrics) {
    updateData.generation_info = {
      ...task.generation_info,
      metrics
    };
  }

  // 更新任务状态
  const { error: updateError } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', task.id);

  if (updateError) {
    console.error('Failed to update task:', updateError);
    throw updateError;
  }

  // 根据任务类型处理结果
  await handleTaskResult(task, output, supabase);

  return { success: true, task_id: task.id };
}

async function handleTaskResult(task: any, output: any, supabase: any) {
  switch (task.type) {
    case 'image_generation':
      await handleImageGenerationResult(task, output, supabase);
      break;
    case 'video_generation':
      await handleVideoGenerationResult(task, output, supabase);
      break;
    case 'voice_generation':
      await handleVoiceGenerationResult(task, output, supabase);
      break;
    default:
      console.log(`No specific handler for task type: ${task.type}`);
  }
}

async function handleImageGenerationResult(task: any, output: any, supabase: any) {
  if (!output || !Array.isArray(output)) return;

  const shotId = task.params?.shot_id;
  const keyframeId = task.params?.keyframe_id;

  if (!shotId || !keyframeId) return;

  // 为每个生成的图片创建候选记录
  for (let i = 0; i < output.length; i++) {
    const imageUrl = output[i];
    
    await supabase.from('keyframe_candidates').insert({
      keyframe_id: keyframeId,
      candidate_index: i,
      image_path: imageUrl,
      seed: task.params?.seed,
      is_selected: i === 0 // 默认选择第一个
    });
  }

  // 更新关键帧状态
  await supabase
    .from('keyframes')
    .update({ 
      status: 'completed',
      selected_candidate: 0 
    })
    .eq('id', keyframeId);
}

async function handleVideoGenerationResult(task: any, output: any, supabase: any) {
  if (!output || typeof output !== 'string') return;

  const shotId = task.params?.shot_id;
  if (!shotId) return;

  // 创建视频记录
  await supabase.from('shot_videos').insert({
    shot_id: shotId,
    video_path: output,
    seed: task.params?.seed,
    frames: task.params?.frames || 24,
    fps: task.params?.fps || 24,
    is_selected: true,
    status: 'completed'
  });

  // 更新分镜状态
  await supabase
    .from('shots')
    .update({ 
      status: 'video_ready' 
    })
    .eq('id', shotId);
}

async function handleVoiceGenerationResult(task: any, output: any, supabase: any) {
  if (!output || typeof output !== 'string') return;

  const episodeId = task.params?.episode_id;
  const shotId = task.params?.shot_id;
  const dialogueId = task.params?.dialogue_id;

  if (!episodeId) return;

  // 创建音频记录
  const { data: audioClip } = await supabase
    .from('audio_clips')
    .insert({
      episode_id: episodeId,
      type: 'dialogue',
      shot_id: shotId,
      file_path: output,
      duration_s: task.params?.duration,
      provider: task.provider,
      voice_id: task.params?.voice_id
    })
    .select('id')
    .single();

  // 如果有对话ID，更新对话记录
  if (dialogueId && audioClip) {
    await supabase
      .from('dialogues')
      .update({ audio_clip_id: audioClip.id })
      .eq('id', dialogueId);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 使用服务密钥进行认证（webhook 调用）
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: WebhookPayload = await req.json();
    console.log('Webhook received:', payload);

    // 验证webhook来源（可选：检查签名等）
    const userAgent = req.headers.get('user-agent') || '';
    const signature = req.headers.get('webhook-signature');

    // TODO: 验证 webhook 签名确保来源合法

    let result;

    // 根据来源处理不同的webhook
    if (userAgent.includes('Replicate') || req.url.includes('/replicate')) {
      result = await handleReplicateWebhook(payload, supabase);
    } else {
      // 通用处理
      result = await handleReplicateWebhook(payload, supabase);
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});