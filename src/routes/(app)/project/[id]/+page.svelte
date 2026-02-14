<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Input from '$lib/components/ui/input.svelte';

	let { data } = $props();
	const supabase = createSupabaseBrowserClient();

	let episodes = $state(data.episodes || []);
	let newTitle = $state('');
	let creating = $state(false);

	async function createEpisode() {
		creating = true;
		const nextNum = episodes.length > 0 ? Math.max(...episodes.map((e: any) => e.episode_number)) + 1 : 1;
		const { data: ep, error } = await supabase.from('episodes').insert({
			project_id: data.project.id,
			episode_number: nextNum,
			title: newTitle.trim() || `第 ${nextNum} 集`
		}).select().single();
		if (ep) {
			episodes = [...episodes, ep];
			newTitle = '';
		}
		creating = false;
	}
</script>

<svelte:head>
	<title>{data.project.name} - VStudio</title>
</svelte:head>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-2">{data.project.name}</h1>
	{#if data.project.description}
		<p class="text-muted-foreground mb-6">{data.project.description}</p>
	{/if}

	<div class="grid grid-cols-2 gap-4 mb-8">
		<Card class="p-4">
			<div class="text-sm text-muted-foreground">剧集数</div>
			<div class="text-3xl font-bold">{episodes.length}</div>
		</Card>
		<Card class="p-4">
			<div class="text-sm text-muted-foreground">状态</div>
			<div class="text-3xl font-bold capitalize">{data.project.status}</div>
		</Card>
	</div>

	<h2 class="text-lg font-semibold mb-3">剧集列表</h2>

	<div class="space-y-2 mb-4">
		{#each episodes as ep}
			<Card class="p-3 flex items-center justify-between">
				<div>
					<span class="font-medium">EP{String(ep.episode_number).padStart(2, '0')}</span>
					{#if ep.title}
						<span class="ml-2 text-muted-foreground">{ep.title}</span>
					{/if}
				</div>
				<span class="text-xs px-2 py-1 rounded-full bg-muted">{ep.status}</span>
			</Card>
		{/each}
	</div>

	<form onsubmit={(e) => { e.preventDefault(); createEpisode(); }} class="flex gap-2">
		<Input bind:value={newTitle} placeholder="新剧集标题（可选）" class="max-w-xs" />
		<Button type="submit" disabled={creating}>+ 添加剧集</Button>
	</form>
</div>
