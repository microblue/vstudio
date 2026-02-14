<script lang="ts">
	import { onMount } from 'svelte';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let { data } = $props();
	const supabase = createSupabaseBrowserClient();

	let shots: any[] = $state([]);
	let selectedShot: any = $state(null);
	let loading = $state(true);

	onMount(async () => {
		if (data.episodes?.length > 0) {
			const { data: s } = await supabase
				.from('shots')
				.select('*')
				.eq('episode_id', data.episodes[0].id)
				.order('sort_order');
			shots = s ?? [];
		}
		loading = false;
	});

	async function generateShots() {
		alert('分镜生成功能需要配置 Edge Function (llm-proxy)');
	}

	async function addShot() {
		if (!data.episodes?.length) return;
		const nextOrder = shots.length;
		const shotId = `S${String(nextOrder + 1).padStart(2, '0')}`;
		const { data: s } = await supabase.from('shots').insert({
			episode_id: data.episodes[0].id,
			shot_id: shotId,
			sort_order: nextOrder,
			duration_s: 3.0
		}).select().single();
		if (s) shots = [...shots, s];
	}
</script>

<svelte:head>
	<title>分镜编辑 - {data.project.name}</title>
</svelte:head>

<div class="flex flex-col h-full">
	<div class="flex items-center justify-between p-4 border-b">
		<h2 class="font-semibold">分镜编辑器</h2>
		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={generateShots}>🤖 AI 生成分镜</Button>
			<Button size="sm" onclick={addShot}>+ 添加镜头</Button>
		</div>
	</div>

	{#if loading}
		<div class="flex-1 flex items-center justify-center text-muted-foreground">加载中...</div>
	{:else if !data.episodes?.length}
		<div class="flex-1 flex items-center justify-center text-muted-foreground">请先创建剧集</div>
	{:else}
		<!-- Timeline -->
		<div class="border-b p-4 overflow-x-auto">
			<div class="flex gap-2 min-w-max">
				{#each shots as shot, i}
					<button
						class="flex-shrink-0 w-24 p-2 rounded-md border text-xs text-center transition-colors"
						class:bg-primary={selectedShot?.id === shot.id}
						class:text-primary-foreground={selectedShot?.id === shot.id}
						class:hover:bg-accent={selectedShot?.id !== shot.id}
						onclick={() => selectedShot = shot}
					>
						<div class="font-bold">{shot.shot_id}</div>
						<div>{shot.duration_s}s</div>
						<div class="truncate text-[10px]">{shot.camera || '—'}</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Detail panel -->
		<div class="flex-1 overflow-auto p-4">
			{#if selectedShot}
				<Card class="p-4 space-y-3">
					<h3 class="font-semibold">镜头 {selectedShot.shot_id}</h3>
					<div class="grid grid-cols-2 gap-3 text-sm">
						<div><span class="text-muted-foreground">时长:</span> {selectedShot.duration_s}s</div>
						<div><span class="text-muted-foreground">景别:</span> {selectedShot.camera || '—'}</div>
						<div><span class="text-muted-foreground">情绪:</span> {selectedShot.emotion || '—'}</div>
						<div><span class="text-muted-foreground">转场:</span> {selectedShot.transition_out}</div>
					</div>
					{#if selectedShot.action}
						<div>
							<p class="text-sm text-muted-foreground">画面描述</p>
							<p class="text-sm">{selectedShot.action}</p>
						</div>
					{/if}
					{#if selectedShot.prompt_visual}
						<div>
							<p class="text-sm text-muted-foreground">Visual Prompt</p>
							<p class="text-xs font-mono bg-muted p-2 rounded">{selectedShot.prompt_visual}</p>
						</div>
					{/if}
					{#if selectedShot.prompt_motion}
						<div>
							<p class="text-sm text-muted-foreground">Motion Prompt</p>
							<p class="text-xs font-mono bg-muted p-2 rounded">{selectedShot.prompt_motion}</p>
						</div>
					{/if}
				</Card>
			{:else}
				<div class="flex items-center justify-center h-full text-muted-foreground">
					{shots.length > 0 ? '选择一个镜头查看详情' : '点击「添加镜头」或「AI 生成分镜」开始'}
				</div>
			{/if}
		</div>
	{/if}
</div>
