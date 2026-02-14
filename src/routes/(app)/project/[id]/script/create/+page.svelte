<script lang="ts">
	import { goto } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Label from '$lib/components/ui/label.svelte';

	let { data } = $props();
	const supabase = createSupabaseBrowserClient();

	let outline = $state('');
	let genre = $state('');
	let targetDuration = $state('3min');
	let language = $state('zh');
	let extraRequirements = $state('');
	let model = $state('claude-sonnet-4');
	let generating = $state(false);
	let generatedScript = $state('');
	let error = $state('');

	const genres = ['科幻', '悬疑', '爱情', '喜剧', '恐怖', '动作', '奇幻', '剧情'];
	const durations = [
		{ value: '1min', label: '1 分钟' },
		{ value: '3min', label: '3 分钟' },
		{ value: '5min', label: '5 分钟' },
		{ value: '10min', label: '10 分钟' }
	];
	const models = [
		{ value: 'claude-sonnet-4', label: 'Claude Sonnet 4（快速）' },
		{ value: 'claude-opus-4', label: 'Claude Opus 4（高质量）' },
		{ value: 'gpt-4o', label: 'GPT-4o' },
		{ value: 'deepseek-r1', label: 'DeepSeek R1' }
	];

	async function generate() {
		if (!outline.trim()) { error = '请输入故事大纲'; return; }
		generating = true;
		error = '';
		generatedScript = '';

		try {
			// Call Edge Function for screenplay generation
			const { data: session } = await supabase.auth.getSession();
			const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/screenplay-generate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session.session?.access_token}`
				},
				body: JSON.stringify({
					project_id: data.project.id,
					outline: outline.trim(),
					genre,
					target_duration: targetDuration,
					language,
					extra_requirements: extraRequirements,
					model,
					stream: false
				})
			});

			if (!res.ok) {
				// Fallback: just show a placeholder
				generatedScript = `# 生成的剧本\n\n> Edge Function 尚未部署。请配置 Supabase Edge Functions 后重试。\n\n基于大纲: ${outline}`;
			} else {
				const result = await res.json();
				generatedScript = result.script || result.generated_script || '';
			}
		} catch (e) {
			// Offline fallback
			generatedScript = `# 剧本草稿\n\n> AI 服务暂不可用，请手动编写或稍后重试。\n\n## 故事大纲\n${outline}`;
		}

		generating = false;
	}

	async function adoptScript() {
		if (!generatedScript || !data.episodes?.length) return;
		const episodeId = data.episodes[0].id;

		// Check if script exists
		const { data: existing } = await supabase.from('scripts').select('id').eq('episode_id', episodeId).single();
		if (existing) {
			await supabase.from('scripts').update({ content: generatedScript }).eq('id', existing.id);
		} else {
			await supabase.from('scripts').insert({ episode_id: episodeId, content: generatedScript });
		}

		goto(`/(app)/project/${data.project.id}/script`);
	}
</script>

<svelte:head>
	<title>AI 剧本创作 - {data.project.name}</title>
</svelte:head>

<div class="p-6 max-w-4xl mx-auto">
	<h2 class="text-xl font-bold mb-6">✨ AI 剧本创作</h2>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Input Form -->
		<Card class="p-5 space-y-4">
			<div>
				<Label for="outline">故事大纲 *</Label>
				<Textarea id="outline" bind:value={outline} rows={5} placeholder="描述你的故事想法..." />
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div>
					<Label for="genre">类型</Label>
					<select id="genre" bind:value={genre} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						<option value="">不限</option>
						{#each genres as g}
							<option value={g}>{g}</option>
						{/each}
					</select>
				</div>
				<div>
					<Label for="duration">目标时长</Label>
					<select id="duration" bind:value={targetDuration} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						{#each durations as d}
							<option value={d.value}>{d.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div>
				<Label for="extra">补充要求</Label>
				<Textarea id="extra" bind:value={extraRequirements} rows={2} placeholder="角色设定、世界观..." />
			</div>

			<div>
				<Label>选择模型</Label>
				<div class="space-y-2 mt-1">
					{#each models as m}
						<label class="flex items-center gap-2 text-sm">
							<input type="radio" name="model" value={m.value} bind:group={model} />
							{m.label}
						</label>
					{/each}
				</div>
			</div>

			{#if error}
				<div class="text-sm text-destructive">{error}</div>
			{/if}

			<Button class="w-full" onclick={generate} disabled={generating}>
				{generating ? '生成中...' : '🚀 生成剧本'}
			</Button>
		</Card>

		<!-- Output -->
		<Card class="p-5">
			<h3 class="font-semibold mb-3">生成结果</h3>
			{#if generatedScript}
				<div class="prose prose-sm max-w-none max-h-[500px] overflow-auto mb-4 p-3 bg-muted/50 rounded-md">
					{@html generatedScript.replace(/\n/g, '<br>')}
				</div>
				<div class="flex gap-2">
					<Button onclick={adoptScript}>采用此剧本</Button>
					<Button variant="outline" onclick={generate}>重新生成</Button>
				</div>
			{:else if generating}
				<div class="flex items-center justify-center py-20 text-muted-foreground">
					<span class="animate-pulse">AI 正在创作中...</span>
				</div>
			{:else}
				<div class="flex items-center justify-center py-20 text-muted-foreground">
					填写大纲后点击生成
				</div>
			{/if}
		</Card>
	</div>
</div>
