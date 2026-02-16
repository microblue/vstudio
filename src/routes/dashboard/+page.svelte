<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button.svelte';
	import { 
		Plus, 
		Film, 
		Clock, 
		Sparkles, 
		Zap, 
		TrendingUp,
		Play,
		Edit,
		Trash2,
		Calendar
	} from 'lucide-svelte';
	import type { Database } from '$lib/database.types';
	
	type Project = Database['public']['Tables']['projects']['Row'];
	
	const supabase = createSupabaseBrowserClient();
	
	let projects: Project[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		await loadProjects();
	});

	async function loadProjects() {
		try {
			loading = true;
			
			const { data, error: err } = await supabase
				.from('projects')
				.select('*')
				.order('updated_at', { ascending: false });

			if (err) throw err;
			projects = data || [];
		} catch (err) {
			error = '加载项目失败: ' + (err as Error).message;
			console.error('Load projects error:', err);
		} finally {
			loading = false;
		}
	}

	async function createProject() {
		try {
			const { data, error: err } = await supabase
				.from('projects')
				.insert({
					name: `新项目 ${new Date().toLocaleString()}`,
					description: '',
					status: 'planning'
				})
				.select('id')
				.single();

			if (err) throw err;
			
			// 跳转到新项目的剧本创作页
			goto(`/project/${data.id}/script/create`);
		} catch (err) {
			error = '创建项目失败: ' + (err as Error).message;
		}
	}

	async function deleteProject(projectId: string) {
		if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) return;
		
		try {
			const { error: err } = await supabase
				.from('projects')
				.delete()
				.eq('id', projectId);

			if (err) throw err;
			
			projects = projects.filter(p => p.id !== projectId);
		} catch (err) {
			error = '删除项目失败: ' + (err as Error).message;
		}
	}

	function getStatusBadge(status: string) {
		const statusMap = {
			'planning': { label: '策划中', class: 'bg-blue-100 text-blue-800' },
			'in_progress': { label: '制作中', class: 'bg-yellow-100 text-yellow-800' },
			'completed': { label: '已完成', class: 'bg-green-100 text-green-800' },
			'archived': { label: '已归档', class: 'bg-gray-100 text-gray-800' }
		};
		return statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800' };
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('zh-CN');
	}
</script>

<svelte:head>
	<title>我的项目 - VStudio</title>
</svelte:head>

<div class="container mx-auto py-6 px-4 max-w-7xl">
	<!-- 顶部区域 -->
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900 mb-2">
					欢迎回到 VStudio 🎬
				</h1>
				<p class="text-slate-600">
					管理您的短剧项目，让 AI 助力创作
				</p>
			</div>
			
			<Button 
				on:click={createProject}
				class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
			>
				<Plus class="w-4 h-4 mr-2" />
				新建项目
			</Button>
		</div>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
			{error}
		</div>
	{/if}

	<!-- 快速操作卡片 -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<Card class="border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer" on:click={createProject}>
			<CardHeader class="pb-3">
				<div class="flex items-center space-x-3">
					<div class="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
						<Sparkles class="w-5 h-5 text-white" />
					</div>
					<CardTitle class="text-lg">AI 剧本创作</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<CardDescription>从故事大纲开始，让 AI 生成专业剧本</CardDescription>
			</CardContent>
		</Card>

		<Card class="border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer opacity-50">
			<CardHeader class="pb-3">
				<div class="flex items-center space-x-3">
					<div class="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
						<Zap class="w-5 h-5 text-white" />
					</div>
					<CardTitle class="text-lg">视觉生成</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<CardDescription>即将推出：AI 生成关键帧和场景</CardDescription>
			</CardContent>
		</Card>

		<Card class="border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer opacity-50">
			<CardHeader class="pb-3">
				<div class="flex items-center space-x-3">
					<div class="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
						<TrendingUp class="w-5 h-5 text-white" />
					</div>
					<CardTitle class="text-lg">智能分析</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<CardDescription>即将推出：项目数据分析和优化建议</CardDescription>
			</CardContent>
		</Card>
	</div>

	<!-- 项目列表 -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center space-x-2">
				<Film class="w-5 h-5" />
				<span>我的项目</span>
			</CardTitle>
			<CardDescription>
				{projects.length > 0 ? `共 ${projects.length} 个项目` : '还没有项目，开始创建吧！'}
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="flex items-center space-x-2 text-slate-600">
						<div class="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
						<span>加载中...</span>
					</div>
				</div>
			{:else if projects.length === 0}
				<div class="text-center py-12">
					<div class="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
						<Film class="w-12 h-12 text-purple-500" />
					</div>
					<h3 class="text-lg font-semibold text-slate-900 mb-2">开始您的第一个项目</h3>
					<p class="text-slate-600 mb-6">用 AI 创作专业短剧，让创意变成现实</p>
					<Button 
						on:click={createProject}
						class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
					>
						<Plus class="w-4 h-4 mr-2" />
						创建第一个项目
					</Button>
				</div>
			{:else}
				<div class="space-y-4">
					{#each projects as project}
						<div class="group border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-purple-200 transition-all duration-200">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="flex items-center space-x-3 mb-2">
										<h3 class="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
											{project.name}
										</h3>
										<span class="px-2 py-1 rounded-full text-xs font-medium {getStatusBadge(project.status).class}">
											{getStatusBadge(project.status).label}
										</span>
									</div>
									
									{#if project.description}
										<p class="text-slate-600 text-sm mb-3">{project.description}</p>
									{/if}
									
									<div class="flex items-center space-x-4 text-xs text-slate-500">
										<div class="flex items-center space-x-1">
											<Calendar class="w-3 h-3" />
											<span>创建于 {formatDate(project.created_at)}</span>
										</div>
										<div class="flex items-center space-x-1">
											<Clock class="w-3 h-3" />
											<span>更新于 {formatDate(project.updated_at)}</span>
										</div>
									</div>
								</div>
								
								<div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
									<Button 
										variant="ghost" 
										size="sm"
										on:click={() => goto(`/project/${project.id}`)}
									>
										<Play class="w-4 h-4" />
									</Button>
									<Button 
										variant="ghost" 
										size="sm"
										on:click={() => goto(`/project/${project.id}/script/create`)}
									>
										<Edit class="w-4 h-4" />
									</Button>
									<Button 
										variant="ghost" 
										size="sm"
										class="text-red-600 hover:text-red-700 hover:bg-red-50"
										on:click={() => deleteProject(project.id)}
									>
										<Trash2 class="w-4 h-4" />
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>