<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>导出 - {data.project.name}</title>
</svelte:head>

<div class="p-6">
	<h2 class="text-xl font-bold mb-6">📤 导出</h2>

	<Card class="p-6 max-w-lg">
		<h3 class="font-semibold mb-4">导出设置</h3>
		<div class="space-y-3 text-sm">
			<div class="flex justify-between"><span>分辨率</span><span class="font-medium">1920×1080</span></div>
			<div class="flex justify-between"><span>帧率</span><span class="font-medium">24 fps</span></div>
			<div class="flex justify-between"><span>格式</span><span class="font-medium">MP4 (H.264)</span></div>
			<div class="flex justify-between"><span>字幕</span><span class="font-medium">烧录</span></div>
		</div>
		<Button class="w-full mt-6" disabled>完成合成后可导出</Button>
	</Card>
</div>
