<script lang="ts">
	import { page } from '$app/stores';

	let { data, children } = $props();

	const navItems = [
		{ href: '', label: '概览', icon: '📊' },
		{ href: '/script/create', label: '剧本创作', icon: '✨' },
		{ href: '/script', label: '剧本编辑', icon: '📝' },
		{ href: '/assets', label: '资产管理', icon: '🎭' },
		{ href: '/shots', label: '分镜编辑', icon: '🎬' },
		{ href: '/generate', label: '画面生成', icon: '🖼️' },
		{ href: '/audio', label: '音频工作台', icon: '🎵' },
		{ href: '/compose', label: '后期合成', icon: '🎞️' },
		{ href: '/export', label: '导出', icon: '📤' }
	];

	const basePath = $derived(`/(app)/project/${data.project.id}`);
</script>

<div class="flex h-full">
	<!-- Project Sidebar -->
	<aside class="w-48 shrink-0 border-r bg-background">
		<div class="p-3 border-b">
			<h2 class="font-semibold text-sm truncate">{data.project.name}</h2>
			<p class="text-xs text-muted-foreground">项目导航</p>
		</div>
		<nav class="p-2 space-y-0.5">
			{#each navItems as item}
				{@const fullHref = basePath + item.href}
				<a
					href={fullHref}
					class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent transition-colors"
					class:bg-accent={$page.url.pathname === fullHref}
				>
					<span>{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
	</aside>

	<!-- Content -->
	<div class="flex-1 overflow-auto">
		{@render children()}
	</div>
</div>
