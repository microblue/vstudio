<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>音频工作台 - {data.project.name}</title>
</svelte:head>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-bold">🎵 音频工作台</h2>
		<div class="flex gap-2">
			<Button variant="outline">批量生成配音</Button>
			<Button>生成字幕</Button>
		</div>
	</div>

	<Card class="p-4 mb-6">
		<h3 class="font-semibold mb-3">角色音色配置</h3>
		<p class="text-sm text-muted-foreground">在资产管理中添加角色后，在这里配置每个角色的音色</p>
	</Card>

	<div class="text-center py-20 text-muted-foreground">
		<p class="text-lg mb-2">音频工作台</p>
		<p class="text-sm">配音生成需要配置 Fish Audio API 和 Edge Functions</p>
	</div>
</div>
