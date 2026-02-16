<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button.svelte';
	import { Settings, User, Shield, Palette, Bell, Database } from 'lucide-svelte';
</script>

<svelte:head>
	<title>系统设置 - VStudio</title>
</svelte:head>

<div class="container mx-auto py-6 px-4 max-w-4xl">
	<!-- 页面标题 -->
	<div class="mb-8">
		<div class="flex items-center space-x-3 mb-4">
			<div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
				<Settings class="w-5 h-5 text-white" />
			</div>
			<div>
				<h1 class="text-3xl font-bold text-slate-900">系统设置</h1>
				<p class="text-slate-600 mt-1">管理您的账户设置和偏好</p>
			</div>
		</div>
	</div>

	<!-- 设置选项 -->
	<div class="space-y-6">
		<!-- 账户设置 -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<User class="w-5 h-5" />
					<span>账户设置</span>
				</CardTitle>
				<CardDescription>管理您的账户信息和登录设置</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="text-sm text-slate-600">
					<p>当前使用演示账号：<strong>test@vstudio.ai</strong></p>
					<p class="mt-2 text-amber-600">💡 这是一个演示环境，所有数据仅用于功能展示</p>
				</div>
			</CardContent>
		</Card>

		<!-- 安全设置 -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<Shield class="w-5 h-5" />
					<span>安全设置</span>
				</CardTitle>
				<CardDescription>保护您的账户安全</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="text-sm text-slate-600">
					<p>即将推出：</p>
					<ul class="list-disc list-inside mt-2 space-y-1">
						<li>双因素认证</li>
						<li>登录设备管理</li>
						<li>访问日志查看</li>
					</ul>
				</div>
			</CardContent>
		</Card>

		<!-- 界面设置 -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<Palette class="w-5 h-5" />
					<span>界面设置</span>
				</CardTitle>
				<CardDescription>自定义您的使用体验</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="text-sm text-slate-600">
					<p>即将推出：</p>
					<ul class="list-disc list-inside mt-2 space-y-1">
						<li>深色模式切换</li>
						<li>主题色彩设置</li>
						<li>字体大小调整</li>
						<li>语言选择</li>
					</ul>
				</div>
			</CardContent>
		</Card>

		<!-- 通知设置 -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<Bell class="w-5 h-5" />
					<span>通知设置</span>
				</CardTitle>
				<CardDescription>控制您接收的通知类型</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="text-sm text-slate-600">
					<p>即将推出：</p>
					<ul class="list-disc list-inside mt-2 space-y-1">
						<li>项目完成通知</li>
						<li>系统更新通知</li>
						<li>邮件提醒设置</li>
					</ul>
				</div>
			</CardContent>
		</Card>

		<!-- 数据管理 -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<Database class="w-5 h-5" />
					<span>数据管理</span>
				</CardTitle>
				<CardDescription>管理您的项目数据</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="text-sm text-slate-600">
					<p>即将推出：</p>
					<ul class="list-disc list-inside mt-2 space-y-1">
						<li>数据导出</li>
						<li>项目备份</li>
						<li>云同步设置</li>
					</ul>
				</div>
			</CardContent>
		</Card>

		<!-- 版本信息 -->
		<Card>
			<CardHeader>
				<CardTitle>版本信息</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-sm text-slate-600 space-y-2">
					<p><strong>VStudio</strong> v1.0.0-beta</p>
					<p><strong>技术栈:</strong> SvelteKit + Supabase + AI APIs</p>
					<p><strong>构建时间:</strong> 2026-02-16</p>
					<div class="mt-4 pt-4 border-t border-slate-200">
						<p class="text-xs text-slate-500">
							💝 感谢使用 VStudio，让创意无限可能！<br />
							🚀 项目正在积极开发中，更多功能即将推出
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>