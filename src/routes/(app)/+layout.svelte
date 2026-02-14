<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';

	let { data, children } = $props();
	const supabase = createSupabaseBrowserClient();

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/auth/login');
	}
</script>

<div class="flex h-screen">
	<!-- Sidebar -->
	<aside class="w-56 shrink-0 border-r bg-muted/30 flex flex-col">
		<div class="p-4 border-b">
			<a href="/(app)" class="text-xl font-bold">VStudio</a>
		</div>
		<nav class="flex-1 p-3 space-y-1">
			<a href="/(app)" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
				📁 项目列表
			</a>
			<a href="/(app)/settings" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
				⚙️ 系统设置
			</a>
		</nav>
		<div class="p-3 border-t">
			<p class="text-xs text-muted-foreground mb-2 truncate">{data.user?.email}</p>
			<Button variant="ghost" size="sm" class="w-full justify-start" onclick={handleLogout}>
				退出登录
			</Button>
		</div>
	</aside>

	<!-- Main -->
	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>
</div>
