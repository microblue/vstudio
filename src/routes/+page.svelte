<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Play, Sparkles, Film, Wand2, Volume2, Download } from 'lucide-svelte';
	
	let mounted = false;
	let currentFeature = 0;
	
	const features = [
		{
			icon: Wand2,
			title: '智能剧本创作',
			description: 'AI 大师级编剧，秒速生成专业剧本',
			color: 'from-purple-600 to-pink-600'
		},
		{
			icon: Film,
			title: '视觉场景生成',
			description: '一键生成电影级关键帧和场景',
			color: 'from-blue-600 to-cyan-600'
		},
		{
			icon: Volume2,
			title: '智能语音合成',
			description: '真人级 AI 配音，多语言支持',
			color: 'from-green-600 to-emerald-600'
		}
	];

	onMount(() => {
		mounted = true;
		// 特色功能轮播
		const interval = setInterval(() => {
			currentFeature = (currentFeature + 1) % features.length;
		}, 4000);
		
		return () => clearInterval(interval);
	});

	function scrollToFeatures() {
		if (browser) {
			document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<svelte:head>
	<title>VStudio - AI 短剧创作平台</title>
	<meta name="description" content="下一代 AI 驱动的短剧创作平台，让创意无限可能" />
</svelte:head>

<!-- 英雄区域 -->
<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
	<!-- 动态背景 -->
	<div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
		<!-- 网格背景 -->
		<div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
		
		<!-- 浮动装饰元素 -->
		{#if mounted}
			<div class="absolute top-20 left-10 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
			<div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
			<div class="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
			
			<!-- 新增：流动的光效 -->
			<div class="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-bounce delay-500"></div>
			<div class="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-2xl animate-bounce delay-1500"></div>
		{/if}
	</div>

	<!-- 主要内容 -->
	<div class="relative z-10 container mx-auto px-6 text-center">
		<div class="max-w-4xl mx-auto">
			<!-- Logo 和标题 -->
			<div class="mb-8 animate-fade-in-up">
				<div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl">
					<Film class="w-10 h-10 text-white" />
				</div>
				
				<h1 class="text-6xl md:text-8xl font-black text-white mb-6">
					<span class="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
						VStudio
					</span>
				</h1>
				
				<p class="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
					下一代 AI 驱动的短剧创作平台<br />
					<span class="text-purple-300">让每个创意都能成为杰作</span>
				</p>
			</div>

			<!-- CTA 按钮组 -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up delay-300">
				<a href="/auth/login" class="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300">
					<Play class="w-5 h-5 mr-2" />
					立即开始创作
					<div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
				</a>
				
				<button on:click={scrollToFeatures} class="group inline-flex items-center justify-center px-8 py-4 border-2 border-purple-400 text-purple-300 font-semibold rounded-xl hover:bg-purple-400 hover:text-white transition-all duration-300">
					<Sparkles class="w-5 h-5 mr-2" />
					探索功能
				</button>
			</div>

			<!-- 统计数据 -->
			{#if mounted}
				<div class="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up delay-500">
					<div class="text-center">
						<div class="text-2xl md:text-3xl font-bold text-white mb-1">10K+</div>
						<div class="text-sm text-slate-400">创作者</div>
					</div>
					<div class="text-center">
						<div class="text-2xl md:text-3xl font-bold text-white mb-1">50K+</div>
						<div class="text-sm text-slate-400">短剧作品</div>
					</div>
					<div class="text-center">
						<div class="text-2xl md:text-3xl font-bold text-white mb-1">99%</div>
						<div class="text-sm text-slate-400">满意度</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- 滚动提示 -->
	<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
		<div class="w-6 h-10 border-2 border-purple-400 rounded-full flex justify-center">
			<div class="w-1 h-3 bg-purple-400 rounded-full mt-2 animate-pulse"></div>
		</div>
	</div>
</section>

<!-- 特色功能区域 -->
<section id="features" class="py-24 bg-slate-50">
	<div class="container mx-auto px-6">
		<div class="text-center mb-16">
			<h2 class="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
				AI 驱动的创作工具
			</h2>
			<p class="text-xl text-slate-600 max-w-2xl mx-auto">
				从剧本到成品，全流程 AI 协作，让专业创作触手可及
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			{#each features as feature, index}
				<div class="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200">
					<!-- 图标 -->
					<div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br {feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
						<svelte:component this={feature.icon} class="w-8 h-8 text-white" />
					</div>
					
					<!-- 内容 -->
					<h3 class="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
					<p class="text-slate-600 leading-relaxed mb-6">{feature.description}</p>
					
					<!-- 动效装饰 -->
					<div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br {feature.color} rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500"></div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- 演示视频区域 -->
<section class="py-24 bg-slate-900">
	<div class="container mx-auto px-6 text-center">
		<h2 class="text-4xl md:text-5xl font-bold text-white mb-8">
			看看 AI 如何<span class="text-purple-400">重新定义创作</span>
		</h2>
		
		<div class="max-w-4xl mx-auto">
			<div class="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-2 shadow-2xl">
				<div class="bg-slate-800 rounded-xl aspect-video flex items-center justify-center">
					<button class="group inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full hover:bg-white/30 transition-colors duration-300">
						<Play class="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform duration-300" />
					</button>
				</div>
			</div>
			
			<p class="text-slate-400 mt-6">
				观看 3 分钟演示，了解如何用 AI 创作专业短剧
			</p>
		</div>
	</div>
</section>

<!-- 底部 CTA -->
<section class="py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900">
	<div class="container mx-auto px-6 text-center">
		<div class="max-w-3xl mx-auto">
			<h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
				准备开始您的创作之旅？
			</h2>
			<p class="text-xl text-slate-300 mb-8">
				加入数万创作者，用 AI 释放无限创意潜能
			</p>
			
			<a href="/auth/login" class="group inline-flex items-center justify-center px-12 py-5 bg-white text-slate-900 font-bold text-lg rounded-xl hover:bg-slate-100 transition-colors duration-300 shadow-2xl">
				开始免费创作
				<Play class="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
			</a>
		</div>
	</div>
</section>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-fade-in-up {
		animation: fade-in-up 1s ease-out;
	}
	
	.delay-300 {
		animation-delay: 0.3s;
	}
	
	.delay-500 {
		animation-delay: 0.5s;
	}
</style>