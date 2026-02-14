<script lang="ts">
	import { onMount } from 'svelte';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	let { data } = $props();
	const supabase = createSupabaseBrowserClient();

	let content = $state('');
	let saving = $state(false);
	let scriptId = $state<string | null>(null);
	let lastSaved = $state<string | null>(null);
	let episodeId = $state<string | null>(null);

	onMount(async () => {
		// Use first episode if exists
		if (data.episodes?.length > 0) {
			episodeId = data.episodes[0].id;
			const { data: script } = await supabase
				.from('scripts')
				.select('*')
				.eq('episode_id', episodeId)
				.single();
			if (script) {
				content = script.content;
				scriptId = script.id;
			}
		}
	});

	async function save() {
		if (!episodeId) return;
		saving = true;
		if (scriptId) {
			await supabase.from('scripts').update({ content, updated_at: new Date().toISOString() }).eq('id', scriptId);
		} else {
			const { data: s } = await supabase.from('scripts').insert({ episode_id: episodeId, content }).select().single();
			if (s) scriptId = s.id;
		}
		lastSaved = new Date().toLocaleTimeString('zh-CN');
		saving = false;
	}

	// Auto-save debounce
	let timer: ReturnType<typeof setTimeout>;
	function onInput() {
		clearTimeout(timer);
		timer = setTimeout(save, 2000);
	}
</script>

<svelte:head>
	<title>剧本编辑 - {data.project.name}</title>
</svelte:head>

<div class="flex flex-col h-full">
	<div class="flex items-center justify-between p-4 border-b">
		<h2 class="font-semibold">剧本编辑器</h2>
		<div class="flex items-center gap-3">
			{#if lastSaved}
				<span class="text-xs text-muted-foreground">上次保存: {lastSaved}</span>
			{/if}
			<Button size="sm" onclick={save} disabled={saving || !episodeId}>
				{saving ? '保存中...' : '保存'}
			</Button>
		</div>
	</div>

	{#if !episodeId}
		<div class="flex-1 flex items-center justify-center text-muted-foreground">
			<p>请先在项目概览中创建剧集</p>
		</div>
	{:else}
		<div class="flex-1 grid grid-cols-2 gap-0">
			<!-- Editor -->
			<div class="border-r p-4">
				<textarea
					bind:value={content}
					oninput={onInput}
					placeholder="在这里编写你的剧本（Markdown 格式）..."
					class="w-full h-full resize-none border-0 bg-transparent focus:outline-none font-mono text-sm leading-relaxed"
				></textarea>
			</div>
			<!-- Preview -->
			<div class="p-4 overflow-auto prose prose-sm max-w-none">
				{@html content.replace(/\n/g, '<br>')}
			</div>
		</div>
	{/if}
</div>
