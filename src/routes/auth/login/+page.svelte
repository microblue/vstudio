<script lang="ts">
	import { goto } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	const supabase = createSupabaseBrowserClient();

	async function handleLogin() {
		loading = true;
		error = '';

		const { error: err } = await supabase.auth.signInWithPassword({ email, password });

		if (err) {
			error = err.message;
			loading = false;
			return;
		}

		goto('/(app)');
	}
</script>

<svelte:head>
	<title>登录 - VStudio</title>
</svelte:head>

<Card class="p-6">
	<div class="mb-6 text-center">
		<h1 class="text-2xl font-bold">VStudio</h1>
		<p class="text-sm text-muted-foreground mt-1">AI 驱动的电影短剧创作平台</p>
	</div>

	<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="space-y-4">
		{#if error}
			<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
		{/if}

		<div class="space-y-2">
			<Label for="email">邮箱</Label>
			<Input id="email" type="email" bind:value={email} placeholder="user@vstudio.local" required />
		</div>

		<div class="space-y-2">
			<Label for="password">密码</Label>
			<Input id="password" type="password" bind:value={password} placeholder="输入密码" required />
		</div>

		<Button type="submit" class="w-full" disabled={loading}>
			{#if loading}登录中...{:else}登录{/if}
		</Button>
	</form>

	<p class="mt-4 text-center text-sm text-muted-foreground">
		还没有账号？<a href="/auth/register" class="text-primary underline-offset-4 hover:underline">注册</a>
	</p>
</Card>
