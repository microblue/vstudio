<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>后期合成 - {data.project.name}</title>
</svelte:head>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-bold">🎞️ 后期合成</h2>
		<div class="flex gap-2">
			<Button variant="outline">预览</Button>
			<Button>合成输出</Button>
		</div>
	</div>

	<div class="text-center py-20 text-muted-foreground">
		<p class="text-lg mb-2">时间轴编辑器</p>
		<p class="text-sm">完成画面生成和音频制作后，在这里进行最终合成</p>
		<p class="text-sm mt-1">需要配置 FFmpeg 合成服务</p>
	</div>
</div>
