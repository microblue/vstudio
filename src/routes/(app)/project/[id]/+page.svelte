<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button.svelte';
	import { 
		Film, 
		Edit, 
		Play, 
		Settings, 
		Download,
		Sparkles, 
		Image, 
		Volume2, 
		Video,
		ArrowRight,
		Clock,
		CheckCircle,
		AlertCircle
	} from 'lucide-svelte';
	import type { Database } from '$lib/database.types';
	
	type Project = Database['public']['Tables']['projects']['Row'];
	type Episode = Database['public']['Tables']['episodes']['Row'];
	type Script = Database['public']['Tables']['scripts']['Row'];

	let projectId = $page.params.id;
	let project: Project | null = null;
	let episodes: Episode[] = [];
	let scripts: Script[] = [];
	const supabase = createSupabaseBrowserClient();
	let loading = true;
	let error = '';

	onMount(async () => {
		await loadProjectData();
	});

	async function loadProjectData() {
		try {
			loading = true;
			
			// 加载项目信息
			const { data: projectData, error: projectError } = await supabase
				.from('projects')
				.select('*')
				.eq('id', projectId)
				.single();

			if (projectError) throw projectError;
			project = projectData;

			// 加载剧集信息
			const { data: episodesData, error: episodesError } = await supabase
				.from('episodes')
				.select('*')
				.eq('project_id', projectId)
				.order('episode_number');

			if (episodesError) throw episodesError;
			episodes = episodesData || [];

			// 加载剧本信息
			if (episodes.length > 0) {
				const { data: scriptsData, error: scriptsError } = await supabase
					.from('scripts')
					.select('*')
					.in('episode_id', episodes.map(ep => ep.id))
					.order('version', { ascending: false });

				if (scriptsError) throw scriptsError;
				scripts = scriptsData || [];
			}

		} catch (err) {
			error = '加载项目数据失败: ' + (err as Error).message;
		} finally {
			loading = false;
		}
	}

	function getStatusColor(status: string) {
		const statusColors = {
			'planning': 'text-blue-600',
			'in_progress': 'text-yellow-600',
			'completed': 'text-green-600',
			'archived': 'text-gray-600'
		};
		return statusColors[status as keyof typeof statusColors] || 'text-gray-600';
	}

	function getStatusIcon(status: string) {
		const statusIcons = {
			'planning': Clock,
			'in_progress': Play,
			'completed': CheckCircle,
			'archived': Settings
		};
		return statusIcons[status as keyof typeof statusIcons] || AlertCircle;
	}

	function getStatusText(status: string) {
		const statusTexts = {
			'planning': '策划中',
			'in_progress': '制作中',
			'completed': '已完成',
			'archived': '已归档'
		};
		return statusTexts[status as keyof typeof statusTexts] || status;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{project?.name || '项目详情'} - VStudio</title>
</svelte:head>

{#if loading}
	<div class="min-h-screen flex items-center justify-center">
		<div class="flex items-center space-x-3 text-slate-600">
			<div class="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
			<span>加载项目数据...</span>
		</div>
	</div>
{:else if error}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
			<h2 class="text-xl font-semibold text-slate-900 mb-2">加载失败</h2>
			<p class="text-slate-600 mb-4">{error}</p>
			<Button on:click={() => goto('/dashboard')}>
				返回项目列表
			</Button>
		</div>
	</div>
{:else if project}
	<div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
		<div class="container mx-auto py-8 px-4 max-w-6xl">
			<!-- 项目头部 -->
			<div class="mb-8">
				<div class="flex items-start justify-between mb-6">
					<div>
						<div class="flex items-center space-x-3 mb-3">
							<div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
								<Film class="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 class="text-3xl font-bold text-slate-900">{project.name}</h1>
								<div class="flex items-center space-x-2 mt-1">
									<svelte:component this={getStatusIcon(project.status)} class="w-4 h-4 {getStatusColor(project.status)}" />
									<span class="text-sm {getStatusColor(project.status)} font-medium">
										{getStatusText(project.status)}
									</span>
								</div>
							</div>
						</div>
						
						{#if project.description}
							<p class="text-slate-600 max-w-2xl">{project.description}</p>
						{/if}

						<div class="flex items-center space-x-6 mt-4 text-sm text-slate-500">
							<div>创建于 {formatDate(project.created_at)}</div>
							<div>更新于 {formatDate(project.updated_at)}</div>
							<div>{episodes.length} 个剧集</div>
						</div>
					</div>

					<Button 
						on:click={() => goto(`/project/${project.id}/script/create`)}
						class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
					>
						<Sparkles class="w-4 h-4 mr-2" />
						继续创作
					</Button>
				</div>
			</div>

			<!-- 工作流步骤 -->
			<div class="mb-8">
				<h2 class="text-xl font-semibold text-slate-900 mb-4">创作流程</h2>
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
					<!-- 剧本创作 -->
					<Card class="border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer" 
						  on:click={() => goto(`/project/${project.id}/script/create`)}>
						<CardHeader class="pb-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2">
									<Sparkles class="w-5 h-5 text-purple-500" />
									<CardTitle class="text-sm">剧本创作</CardTitle>
								</div>
								{#if scripts.length > 0}
									<CheckCircle class="w-4 h-4 text-green-500" />
								{/if}
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription class="text-xs">
								{scripts.length > 0 ? '已完成剧本创作' : 'AI 生成专业剧本'}
							</CardDescription>
						</CardContent>
					</Card>

					<!-- 资产设计 -->
					<Card class="opacity-50 cursor-not-allowed">
						<CardHeader class="pb-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2">
									<Image class="w-5 h-5 text-blue-500" />
									<CardTitle class="text-sm">资产设计</CardTitle>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription class="text-xs">角色、场景、道具设计</CardDescription>
						</CardContent>
					</Card>

					<!-- 视频生成 -->
					<Card class="opacity-50 cursor-not-allowed">
						<CardHeader class="pb-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2">
									<Video class="w-5 h-5 text-indigo-500" />
									<CardTitle class="text-sm">视频生成</CardTitle>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription class="text-xs">AI 生成关键帧和视频</CardDescription>
						</CardContent>
					</Card>

					<!-- 音频合成 -->
					<Card class="opacity-50 cursor-not-allowed">
						<CardHeader class="pb-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2">
									<Volume2 class="w-5 h-5 text-green-500" />
									<CardTitle class="text-sm">音频合成</CardTitle>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription class="text-xs">AI 语音合成和配乐</CardDescription>
						</CardContent>
					</Card>
				</div>
			</div>

			<!-- 剧集列表 -->
			{#if episodes.length > 0}
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center space-x-2">
							<Film class="w-5 h-5" />
							<span>剧集列表</span>
						</CardTitle>
						<CardDescription>
							共 {episodes.length} 集
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-3">
							{#each episodes as episode}
								<div class="group border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-purple-200 transition-all duration-200">
									<div class="flex items-center justify-between">
										<div>
											<h3 class="font-medium text-slate-900 group-hover:text-purple-600 transition-colors">
												第 {episode.episode_number} 集
												{#if episode.title && episode.title !== `第${episode.episode_number}集`}
													- {episode.title}
												{/if}
											</h3>
											<div class="flex items-center space-x-2 mt-1">
												<svelte:component this={getStatusIcon(episode.status)} class="w-3 h-3 {getStatusColor(episode.status)}" />
												<span class="text-xs {getStatusColor(episode.status)}">
													{getStatusText(episode.status)}
												</span>
											</div>
										</div>
										<div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
												disabled
											>
												<Play class="w-4 h-4" />
											</Button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{:else}
				<!-- 空状态 -->
				<Card>
					<CardContent class="py-12">
						<div class="text-center">
							<div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
								<Sparkles class="w-10 h-10 text-purple-500" />
							</div>
							<h3 class="text-lg font-semibold text-slate-900 mb-2">开始创作您的第一集</h3>
							<p class="text-slate-600 mb-6">使用 AI 创作专业剧本，让想法变成精彩的短剧</p>
							<Button 
								on:click={() => goto(`/project/${project.id}/script/create`)}
								class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
							>
								<Sparkles class="w-4 h-4 mr-2" />
								开始剧本创作
								<ArrowRight class="w-4 h-4 ml-2" />
							</Button>
						</div>
					</CardContent>
				</Card>
			{/if}
		</div>
	</div>
{/if}