<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
</script>

<svelte:head>
	<title>系统设置 - VStudio</title>
</svelte:head>

<div class="p-6 max-w-2xl">
	<h2 class="text-xl font-bold mb-6">⚙️ 系统设置</h2>

	<div class="space-y-4">
		<Card class="p-4">
			<h3 class="font-semibold mb-2">AI 服务状态</h3>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between"><span>LLM (Anthropic)</span><span class="text-muted-foreground">通过 Edge Function 配置</span></div>
				<div class="flex justify-between"><span>图片生成 (Replicate)</span><span class="text-muted-foreground">通过 Edge Function 配置</span></div>
				<div class="flex justify-between"><span>TTS (Fish Audio)</span><span class="text-muted-foreground">通过 Edge Function 配置</span></div>
				<div class="flex justify-between"><span>视频合成 (FFmpeg)</span><span class="text-muted-foreground">通过 Edge Function 配置</span></div>
			</div>
		</Card>

		<Card class="p-4">
			<h3 class="font-semibold mb-2">默认参数</h3>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between"><span>分辨率</span><span>1920×1080</span></div>
				<div class="flex justify-between"><span>帧率</span><span>24 fps</span></div>
				<div class="flex justify-between"><span>关键帧候选数</span><span>3</span></div>
			</div>
		</Card>

		<Card class="p-4">
			<h3 class="font-semibold mb-2">说明</h3>
			<p class="text-sm text-muted-foreground">
				API Key 和第三方服务配置在 Supabase Dashboard → Edge Functions → Secrets 中管理，
				不在前端暴露。详见 .env.example。
			</p>
		</Card>
	</div>
</div>
