<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Film, Mail, Lock, Eye, EyeOff, User, ArrowRight, Check, X } from 'lucide-svelte';
	
	let email = '';
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let showConfirmPassword = false;
	let isLoading = false;
	let mounted = false;

	$: passwordStrength = getPasswordStrength(password);
	$: passwordsMatch = password && confirmPassword && password === confirmPassword;
	$: formValid = email && password.length >= 6 && passwordsMatch;

	onMount(() => {
		mounted = true;
	});

	function getPasswordStrength(pwd) {
		if (!pwd) return { score: 0, text: '', color: 'gray' };
		
		let score = 0;
		if (pwd.length >= 6) score++;
		if (pwd.length >= 10) score++;
		if (/[A-Z]/.test(pwd)) score++;
		if (/[a-z]/.test(pwd)) score++;
		if (/[0-9]/.test(pwd)) score++;
		if (/[^A-Za-z0-9]/.test(pwd)) score++;
		
		if (score <= 2) return { score, text: '弱', color: 'red' };
		if (score <= 4) return { score, text: '中等', color: 'yellow' };
		return { score, text: '强', color: 'green' };
	}

	async function handleRegister() {
		if (!formValid) return;
		
		isLoading = true;
		
		// 模拟注册过程
		setTimeout(async () => {
			try {
				// TODO: 实际注册逻辑
				console.log('Register attempt:', { email, password });
				await goto('/dashboard');
			} finally {
				isLoading = false;
			}
		}, 2000);
	}
</script>

<svelte:head>
	<title>注册 - VStudio</title>
</svelte:head>

<div class="min-h-screen flex">
	<!-- 左侧：视觉区域 -->
	<div class="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
		<!-- 背景装饰 -->
		<div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M0%2040L40%200h40v40L40%2080H0z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
		
		{#if mounted}
			<div class="absolute top-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
			<div class="absolute bottom-10 right-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
			<div class="absolute top-1/2 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
		{/if}

		<!-- 主要内容 -->
		<div class="relative z-10 text-center text-white p-12 max-w-xl">
			<div class="mb-12">
				<div class="inline-flex items-center justify-center w-28 h-28 bg-white/10 backdrop-blur-lg rounded-3xl mb-8 shadow-2xl">
					<Film class="w-14 h-14 text-purple-300" />
				</div>
				<h2 class="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
					加入创作者社区
				</h2>
				<p class="text-xl text-slate-300 leading-relaxed">
					成为数万创作者中的一员，用 AI 技术<br />
					创造出令人惊叹的短剧作品
				</p>
			</div>

			<!-- 数据展示 -->
			<div class="grid grid-cols-3 gap-6 mb-8">
				<div class="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl">
					<div class="text-2xl font-bold text-purple-300 mb-1">10K+</div>
					<div class="text-sm text-slate-400">活跃创作者</div>
				</div>
				<div class="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl">
					<div class="text-2xl font-bold text-pink-300 mb-1">50K+</div>
					<div class="text-sm text-slate-400">精彩作品</div>
				</div>
				<div class="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl">
					<div class="text-2xl font-bold text-blue-300 mb-1">4.9★</div>
					<div class="text-sm text-slate-400">用户评分</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 右侧：注册表单 -->
	<div class="flex-1 flex items-center justify-center p-8 bg-white">
		<div class="w-full max-w-md">
			<!-- 头部 -->
			<div class="text-center mb-8">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
					<Film class="w-8 h-8 text-white" />
				</div>
				<h1 class="text-3xl font-bold text-slate-900">创建账户</h1>
				<p class="text-slate-600 mt-2">开始您的 AI 创作之旅</p>
			</div>

			<!-- 注册表单 -->
			<form on:submit|preventDefault={handleRegister} class="space-y-6">
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
					<p class="mt-1 text-sm text-slate-500">
						无需验证邮箱，可使用任意格式
					</p>
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
							placeholder="设置一个安全密码"
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
					
					<!-- 密码强度 -->
					{#if password}
						<div class="mt-2">
							<div class="flex items-center space-x-2">
								<div class="flex-1 bg-slate-200 rounded-full h-2">
									<div 
										class="h-full rounded-full transition-all duration-300 {passwordStrength.color === 'red' ? 'bg-red-500' : passwordStrength.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}"
										style="width: {(passwordStrength.score / 6) * 100}%"
									></div>
								</div>
								<span class="text-sm font-medium {passwordStrength.color === 'red' ? 'text-red-600' : passwordStrength.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}">
									{passwordStrength.text}
								</span>
							</div>
						</div>
					{/if}
				</div>

				<!-- 确认密码输入 -->
				<div>
					<label for="confirmPassword" class="block text-sm font-semibold text-slate-700 mb-2">
						确认密码
					</label>
					<div class="relative">
						<Lock class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
						<input
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							placeholder="再次输入密码"
							class="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200 text-slate-900"
							required
						/>
						<button
							type="button"
							on:click={() => showConfirmPassword = !showConfirmPassword}
							class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
						>
							{#if showConfirmPassword}
								<EyeOff class="w-5 h-5" />
							{:else}
								<Eye class="w-5 h-5" />
							{/if}
						</button>
					</div>
					
					<!-- 密码匹配指示 -->
					{#if confirmPassword}
						<div class="mt-2 flex items-center space-x-2">
							{#if passwordsMatch}
								<Check class="w-4 h-4 text-green-500" />
								<span class="text-sm text-green-600">密码匹配</span>
							{:else}
								<X class="w-4 h-4 text-red-500" />
								<span class="text-sm text-red-600">密码不匹配</span>
							{/if}
						</div>
					{/if}
				</div>

				<!-- 注册按钮 -->
				<button
					type="submit"
					disabled={isLoading || !formValid}
					class="w-full group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
				>
					{#if isLoading}
						<div class="flex items-center justify-center">
							<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
							创建账户中...
						</div>
					{:else}
						<div class="flex items-center justify-center">
							创建账户
							<ArrowRight class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
						</div>
					{/if}
				</button>
			</form>

			<!-- 登录链接 -->
			<div class="mt-8 text-center">
				<p class="text-slate-600">
					已有账号？
					<a href="/auth/login" class="text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-200">
						立即登录
					</a>
				</p>
			</div>
		</div>
	</div>
</div>