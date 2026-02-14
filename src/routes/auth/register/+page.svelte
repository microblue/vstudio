<script lang="ts">
	import { goto } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');

	const supabase = createSupabaseBrowserClient();

	async function handleRegister() {
		if (password !== confirmPassword) {
			error = '两次输入的密码不一致';
			return;
		}
		if (password.length < 6) {
			error = '密码至少 6 个字符';
			return;
		}

		loading = true;
		error = '';

		const { error: err } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: undefined }
		});

		if (err) {
			error = err.message;
			loading = false;
			return;
		}

		goto('/(app)');
	}
</script>

<svelte:head>
	<title>注册 - VStudio</title>
</svelte:head>

<Card class="p-6">
	<div class="mb-6 text-center">
		<h1 class="text-2xl font-bold">注册 VStudio</h1>
		<p class="text-sm text-muted-foreground mt-1">创建账号，开始创作</p>
	</div>

	<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="space-y-4">
		{#if error}
			<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
		{/if}

		<div class="space-y-2">
			<Label for="email">邮箱</Label>
			<Input id="email" type="email" bind:value={email} placeholder="user@vstudio.local" required />
			<p class="text-xs text-muted-foreground">无需验证邮箱，可使用任意格式</p>
		</div>

		<div class="space-y-2">
			<Label for="password">密码</Label>
			<Input id="password" type="password" bind:value={password} placeholder="至少 6 个字符" required />
		</div>

		<div class="space-y-2">
			<Label for="confirm">确认密码</Label>
			<Input id="confirm" type="password" bind:value={confirmPassword} placeholder="再次输入密码" required />
		</div>

		<Button type="submit" class="w-full" disabled={loading}>
			{#if loading}注册中...{:else}注册{/if}
		</Button>
	</form>

	<p class="mt-4 text-center text-sm text-muted-foreground">
		已有账号？<a href="/auth/login" class="text-primary underline-offset-4 hover:underline">登录</a>
	</p>
</Card>
