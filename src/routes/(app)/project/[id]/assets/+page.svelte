<script lang="ts">
	import { onMount } from 'svelte';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	let { data } = $props();
	const supabase = createSupabaseBrowserClient();

	let activeTab = $state<'characters' | 'locations' | 'props'>('characters');
	let characters: any[] = $state([]);
	let locations: any[] = $state([]);
	let props: any[] = $state([]);
	let extracting = $state(false);

	onMount(loadAssets);

	async function loadAssets() {
		const pid = data.project.id;
		const [c, l, p] = await Promise.all([
			supabase.from('characters').select('*').eq('project_id', pid),
			supabase.from('locations').select('*').eq('project_id', pid),
			supabase.from('props').select('*').eq('project_id', pid)
		]);
		characters = c.data ?? [];
		locations = l.data ?? [];
		props = p.data ?? [];
	}

	async function extractAssets() {
		extracting = true;
		// TODO: Call llm-proxy edge function with action=extract-assets
		alert('资产提取功能需要配置 Edge Function (llm-proxy)');
		extracting = false;
	}

	async function addCharacter() {
		const assetId = `char_${Date.now()}`;
		await supabase.from('characters').insert({
			project_id: data.project.id,
			asset_id: assetId,
			zh_name: '新角色'
		});
		await loadAssets();
	}

	async function addLocation() {
		const assetId = `loc_${Date.now()}`;
		await supabase.from('locations').insert({
			project_id: data.project.id,
			asset_id: assetId,
			zh_name: '新场景'
		});
		await loadAssets();
	}

	async function addProp() {
		const assetId = `prop_${Date.now()}`;
		await supabase.from('props').insert({
			project_id: data.project.id,
			asset_id: assetId,
			zh_name: '新道具'
		});
		await loadAssets();
	}

	async function deleteAsset(table: string, id: string) {
		if (!confirm('确定删除？')) return;
		await supabase.from(table).delete().eq('id', id);
		await loadAssets();
	}

	const tabs = [
		{ key: 'characters' as const, label: '角色', count: () => characters.length },
		{ key: 'locations' as const, label: '场景', count: () => locations.length },
		{ key: 'props' as const, label: '道具', count: () => props.length }
	];
</script>

<svelte:head>
	<title>资产管理 - {data.project.name}</title>
</svelte:head>

<div class="p-6">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-xl font-bold">资产管理</h2>
		<Button onclick={extractAssets} disabled={extracting}>
			{extracting ? '提取中...' : '🤖 从剧本提取'}
		</Button>
	</div>

	<!-- Tabs -->
	<div class="flex gap-1 mb-4 border-b">
		{#each tabs as tab}
			<button
				class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
				class:border-primary={activeTab === tab.key}
				class:text-primary={activeTab === tab.key}
				class:border-transparent={activeTab !== tab.key}
				class:text-muted-foreground={activeTab !== tab.key}
				onclick={() => activeTab = tab.key}
			>
				{tab.label} ({tab.count()})
			</button>
		{/each}
	</div>

	<!-- Content -->
	{#if activeTab === 'characters'}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each characters as c}
				<Card class="p-4">
					<div class="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center text-4xl">
						{c.reference_image ? '🖼️' : '👤'}
					</div>
					<h3 class="font-semibold">{c.zh_name || c.asset_id}</h3>
					{#if c.en_name}<p class="text-sm text-muted-foreground">{c.en_name}</p>{/if}
					{#if c.appearance}<p class="text-xs text-muted-foreground mt-1 line-clamp-2">{c.appearance}</p>{/if}
					<div class="flex gap-2 mt-3">
						<Button variant="outline" size="sm">编辑</Button>
						<Button variant="ghost" size="sm" onclick={() => deleteAsset('characters', c.id)}>删除</Button>
					</div>
				</Card>
			{/each}
			<button onclick={addCharacter} class="border-2 border-dashed rounded-lg p-4 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[200px]">
				+ 添加角色
			</button>
		</div>
	{:else if activeTab === 'locations'}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each locations as loc}
				<Card class="p-4">
					<div class="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center text-4xl">🏔️</div>
					<h3 class="font-semibold">{loc.zh_name || loc.asset_id}</h3>
					{#if loc.atmosphere}<p class="text-xs text-muted-foreground mt-1 line-clamp-2">{loc.atmosphere}</p>{/if}
					<div class="flex gap-2 mt-3">
						<Button variant="outline" size="sm">编辑</Button>
						<Button variant="ghost" size="sm" onclick={() => deleteAsset('locations', loc.id)}>删除</Button>
					</div>
				</Card>
			{/each}
			<button onclick={addLocation} class="border-2 border-dashed rounded-lg p-4 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[150px]">
				+ 添加场景
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each props as p}
				<Card class="p-4">
					<div class="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center text-4xl">🔧</div>
					<h3 class="font-semibold">{p.zh_name || p.asset_id}</h3>
					{#if p.description}<p class="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>{/if}
					<div class="flex gap-2 mt-3">
						<Button variant="outline" size="sm">编辑</Button>
						<Button variant="ghost" size="sm" onclick={() => deleteAsset('props', p.id)}>删除</Button>
					</div>
				</Card>
			{/each}
			<button onclick={addProp} class="border-2 border-dashed rounded-lg p-4 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[200px]">
				+ 添加道具
			</button>
		</div>
	{/if}
</div>
