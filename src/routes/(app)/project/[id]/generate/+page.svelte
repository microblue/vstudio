<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>画面生成 - {data.project.name}</title>
</svelte:head>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-bold">🖼️ 画面/视频生成工作台</h2>
		<div class="flex gap-2">
			<Button variant="outline">批量生成关键帧</Button>
			<Button>批量生成视频</Button>
		</div>
	</div>

	<Card class="p-4 mb-4">
		<div class="flex items-center gap-3 text-sm">
			<span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> 0 运行中</span>
			<span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500"></span> 0 等待中</span>
			<span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-muted-foreground"></span> 0 已完成</span>
		</div>
	</Card>

	<div class="text-center py-20 text-muted-foreground">
		<p class="text-lg mb-2">画面生成工作台</p>
		<p class="text-sm">请先在分镜编辑器中创建镜头，然后在这里生成关键帧图片和视频</p>
		<p class="text-sm mt-1">需要配置 Replicate/fal.ai API 和 Edge Functions</p>
	</div>
</div>
