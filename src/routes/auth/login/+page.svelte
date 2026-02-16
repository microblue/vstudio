<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Film, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-svelte';
	
	let email = '';
	let password = '';
	let showPassword = false;
	let isLoading = false;
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	async function handleLogin() {
		if (!email || !password) return;
		
		isLoading = true;
		
		// 模拟登录过程
		setTimeout(async () => {
			try {
				// 演示账号快速登录
				if (email === 'test@vstudio.ai' && password === 'password123') {
					await goto('/dashboard');
				} else {
					// TODO: 实际登录逻辑
					console.log('Login attempt:', { email, password });
				}
			} finally {
				isLoading = false;
			}
		}, 1500);
	}

	function useDemo() {
		email = 'test@vstudio.ai';
		password = 'password123';
	}
</script>

<svelte:head>
	<title>登录 - VStudio</title>
</svelte:head>

<div class="min-h-screen flex">
	<!-- 左侧：登录表单 -->
	<div class="flex-1 flex items-center justify-center p-8 bg-white">
		<div class="w-full max-w-md">
			<!-- Logo -->
			<div class="text-center mb-8">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
					<Film class="w-8 h-8 text-white" />
				</div>
				<h1 class="text-3xl font-bold text-slate-900">欢迎回来</h1>
				<p class="text-slate-600 mt-2">登录您的 VStudio 账户</p>
			</div>

			<!-- 登录表单 -->
			<form on:submit|preventDefault={handleLogin} class="space-y-6">
				<!-- 邮箱输入 -->
				<div>
					<label for="email" class="block text-sm font-semibold text-slate-700 mb-2">
						邮箱地址
					</label>
					<div class="relative">
						<Mail class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="your@email.com"
							class="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200 text-slate-900"
							required
						/>
					</div>
				</div>

				<!-- 密码输入 -->
				<div>
					<label for="password" class="block text-sm font-semibold text-slate-700 mb-2">
						密码
					</label>
					<div class="relative">
						<Lock class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="输入您的密码"
							class="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200 text-slate-900"
							required
						/>
						<button
							type="button"
							on:click={() => showPassword = !showPassword}
							class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
						>
							{#if showPassword}
								<EyeOff class="w-5 h-5" />
							{:else}
								<Eye class="w-5 h-5" />
							{/if}
						</button>
					</div>
				</div>

				<!-- 登录按钮 -->
				<button
					type="submit"
					disabled={isLoading || !email || !password}
					class="w-full group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
				>
					{#if isLoading}
						<div class="flex items-center justify-center">
							<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
							正在登录...
						</div>
					{:else}
						<div class="flex items-center justify-center">
							登录账户
							<ArrowRight class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
						</div>
					{/if}
				</button>

				<!-- 演示账号 -->
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-slate-200"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-4 bg-white text-slate-500">或者</span>
					</div>
				</div>

				<button
					type="button"
					on:click={useDemo}
					class="w-full group border-2 border-dashed border-purple-300 text-purple-600 font-semibold py-4 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
				>
					<div class="flex items-center justify-center">
						<Sparkles class="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
						使用演示账号
					</div>
				</button>
			</form>

			<!-- 演示账号信息 -->
			{#if mounted}
				<div class="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
					<h3 class="font-semibold text-slate-900 mb-2">🎭 演示账号</h3>
					<div class="space-y-1 text-sm text-slate-600">
						<div><strong>邮箱：</strong>test@vstudio.ai</div>
						<div><strong>密码：</strong>password123</div>
					</div>
				</div>
			{/if}

			<!-- 注册链接 -->
			<div class="mt-8 text-center">
				<p class="text-slate-600">
					还没有账号？
					<a href="/auth/register" class="text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-200">
						立即注册
					</a>
				</p>
			</div>
		</div>
	</div>

	<!-- 右侧：视觉区域 -->
	<div class="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 relative overflow-hidden">
		<!-- 背景装饰 -->
		<div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
		
		{#if mounted}
			<div class="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
			<div class="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
		{/if}

		<!-- 主要内容 -->
		<div class="relative z-10 text-center text-white p-12 max-w-lg">
			<div class="mb-8">
				<div class="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-lg rounded-3xl mb-6">
					<Film class="w-12 h-12 text-purple-300" />
				</div>
				<h2 class="text-4xl font-bold mb-4">
					开启 AI 创作时代
				</h2>
				<p class="text-xl text-purple-200 leading-relaxed">
					让人工智能成为您的创作伙伴，<br />
					将想象力转化为精彩的短剧作品
				</p>
			</div>

			<!-- 特性列表 -->
			<div class="space-y-4 text-left">
				<div class="flex items-center space-x-3">
					<div class="w-2 h-2 bg-purple-400 rounded-full"></div>
					<span class="text-purple-100">智能剧本生成</span>
				</div>
				<div class="flex items-center space-x-3">
					<div class="w-2 h-2 bg-blue-400 rounded-full"></div>
					<span class="text-blue-100">自动场景设计</span>
				</div>
				<div class="flex items-center space-x-3">
					<div class="w-2 h-2 bg-pink-400 rounded-full"></div>
					<span class="text-pink-100">AI 语音合成</span>
				</div>
			</div>
		</div>
	</div>
</div>