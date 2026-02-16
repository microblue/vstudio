<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import Button from '$lib/components/ui/button.svelte';
	import { 
		Film, 
		Home, 
		Settings, 
		LogOut, 
		User,
		Sparkles,
		Play,
		FolderOpen
	} from 'lucide-svelte';

	let { data, children } = $props();
	const supabase = createSupabaseBrowserClient();

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/auth/login');
	}

	const currentPath = $derived($page.url.pathname);

	function isActive(path: string) {
		return currentPath === path || currentPath.startsWith(path + '/');
	}
</script>

<div class="flex h-screen bg-slate-50">
	<!-- Sidebar -->
	<aside class="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm">
		<!-- Logo -->
		<div class="p-6 border-b border-slate-200">
			<a href="/" class="flex items-center space-x-3 group">
				<div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
					<Film class="w-5 h-5 text-white" />
				</div>
				<div>
					<div class="text-xl font-bold text-slate-900">VStudio</div>
					<div class="text-xs text-slate-500">AI 短剧创作平台</div>
				</div>
			</a>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 p-4 space-y-2">
			<!-- 主要导航 -->
			<div class="mb-6">
				<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
					工作台
				</div>
				<a 
					href="/dashboard" 
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
						{currentPath === '/dashboard' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-r-2 border-purple-500' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
				>
					<Home class="w-4 h-4" />
					项目中心
				</a>
			</div>

			<!-- 快速操作 -->
			<div class="mb-6">
				<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
					快速开始
				</div>
				<div class="space-y-1">
					<button 
						class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 group"
						onclick={() => goto('/dashboard?action=create')}
					>
						<div class="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
							<Sparkles class="w-2.5 h-2.5 text-white" />
						</div>
						AI 剧本创作
					</button>
					
					<a 
						href="/dashboard" 
						class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
					>
						<FolderOpen class="w-4 h-4" />
						浏览项目
					</a>
				</div>
			</div>

			<!-- 设置 -->
			<div>
				<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
					设置
				</div>
				<a 
					href="/settings" 
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
						{currentPath === '/settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
				>
					<Settings class="w-4 h-4" />
					系统设置
				</a>
			</div>
		</nav>

		<!-- 用户信息 -->
		<div class="p-4 border-t border-slate-200 bg-slate-50">
			<div class="flex items-center space-x-3 mb-3">
				<div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
					<User class="w-4 h-4 text-white" />
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-sm font-medium text-slate-900 truncate">
						{data.user?.email?.split('@')[0] || '用户'}
					</div>
					<div class="text-xs text-slate-500 truncate">
						{data.user?.email || '未登录'}
					</div>
				</div>
			</div>
			
			<Button 
				variant="ghost" 
				size="sm" 
				class="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
				onclick={handleLogout}
			>
				<LogOut class="w-4 h-4 mr-2" />
				退出登录
			</Button>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>
</div>
