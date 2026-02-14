<script lang="ts">
	import { onMount } from 'svelte';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Input from '$lib/components/ui/input.svelte';

	const supabase = createSupabaseBrowserClient();

	let projects: any[] = $state([]);
	let loading = $state(true);
	let showCreate = $state(false);
	let newName = $state('');
	let newDesc = $state('');
	let creating = $state(false);

	onMount(loadProjects);

	async function loadProjects() {
		loading = true;
		const { data } = await supabase
			.from('projects')
			.select('*')
			.order('updated_at', { ascending: false });
		projects = data ?? [];
		loading = false;
	}

	async function createProject() {
		if (!newName.trim()) return;
		creating = true;
		const { error } = await supabase.from('projects').insert({ name: newName.trim(), description: newDesc.trim() || null });
		if (!error) {
			newName = '';
			newDesc = '';
			showCreate = false;
			await loadProjects();
		}
		creating = false;
	}

	async function deleteProject(id: string) {
		if (!confirm('确定删除此项目？所有数据将不可恢复。')) return;
		await supabase.from('projects').delete().eq('id', id);
		await loadProjects();
	}
</script>

<svelte:head>
	<title>项目列表 - VStudio</title>
</svelte:head>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">我的项目</h1>
		<Button onclick={() => showCreate = !showCreate}>+ 新建项目</Button>
	</div>

	{#if showCreate}
		<Card class="p-4 mb-6">
			<form onsubmit={(e) => { e.preventDefault(); createProject(); }} class="space-y-3">
				<Input bind:value={newName} placeholder="项目名称" required />
				<Input bind:value={newDesc} placeholder="项目描述（可选）" />
				<div class="flex gap-2">
					<Button type="submit" disabled={creating}>{creating ? '创建中...' : '创建'}</Button>
					<Button variant="ghost" onclick={() => showCreate = false}>取消</Button>
				</div>
			</form>
		</Card>
	{/if}

	{#if loading}
		<p class="text-muted-foreground">加载中...</p>
	{:else if projects.length === 0}
		<div class="text-center py-20 text-muted-foreground">
			<p class="text-lg mb-2">还没有项目</p>
			<p class="text-sm">点击「新建项目」开始创作</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each projects as project}
				<Card class="p-4 hover:shadow-md transition-shadow">
					<a href="/(app)/project/{project.id}" class="block">
						<div class="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center text-3xl">
							🎬
						</div>
						<h3 class="font-semibold truncate">{project.name}</h3>
						{#if project.description}
							<p class="text-sm text-muted-foreground truncate mt-1">{project.description}</p>
						{/if}
						<p class="text-xs text-muted-foreground mt-2">
							{new Date(project.updated_at).toLocaleDateString('zh-CN')}
						</p>
					</a>
					<div class="mt-2 flex justify-end">
						<Button variant="ghost" size="sm" onclick={() => deleteProject(project.id)}>删除</Button>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
