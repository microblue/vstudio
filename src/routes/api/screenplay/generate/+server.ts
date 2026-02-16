// API 路由：剧本生成代理 (本地开发版本)
// 在没有部署Edge Functions时提供模拟功能

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseBrowserClient } from '$lib/supabase';

// 模拟剧本生成内容
const SAMPLE_SCREENPLAY = `# 都市爱情故事 - 第一集：邂逅

## Scene 1: 咖啡厅
**时间**: 下午3点
**地点**: 市中心的精品咖啡厅

### Shot 1
- **镜头**: 咖啡厅全景，温暖的午后阳光透过大窗户洒进来
- **时长**: 3秒
- **描述**: 建立场景，展现咖啡厅的温馨氛围。木质桌椅，绿植装饰，几位客人在安静地享受下午茶

### Shot 2  
- **镜头**: 特写 - 小雅专注地在笔记本电脑上工作
- **时长**: 4秒
- **角色**: 小雅 (25岁，UI设计师)
- **动作**: 小雅手指快速敲击键盘，时而皱眉思考，时而满意点头
- **对话**: 
  - 小雅（自言自语）："这个色彩搭配还需要调整一下..."

### Shot 3
- **镜头**: 门口，阿明匆忙进入咖啡厅
- **时长**: 3秒
- **角色**: 阿明 (27岁，程序员)
- **动作**: 阿明手里拿着手机，四处张望寻找座位，步履匆忙但不失优雅
- **描述**: 中景拍摄，突出阿明的匆忙状态

### Shot 4
- **镜头**: 中景 - 阿明不小心撞到小雅的桌子
- **时长**: 5秒
- **动作**: 阿明走向座位时不小心碰到小雅的桌子，小雅的咖啡杯轻微摇晃
- **对话**:
  - 阿明："哎呀，不好意思！我没注意到..."
  - 小雅（抬头，微笑）："没关系的，没事。"

## Scene 2: 初次对话

### Shot 5
- **镜头**: 双人镜头，两人开始交谈
- **时长**: 8秒
- **动作**: 两人眼神交汇，阿明略显尴尬，小雅温和地笑着
- **对话**:
  - 阿明："你是设计师吗？这些界面设计看起来很专业。"
  - 小雅："是的，我在做一个移动应用的UI设计。你呢？"
  - 阿明："我是程序员，也在附近的公司工作。"

### Shot 6
- **镜头**: 特写 - 小雅的笑容
- **时长**: 2秒
- **情感**: 温暖、友善
- **描述**: 展现小雅被阿明的诚恳打动

### Shot 7
- **镜头**: 特写 - 阿明的表情
- **时长**: 2秒  
- **情感**: 紧张但真诚
- **描述**: 阿明意识到自己对这个陌生女孩产生了好感

### Shot 8
- **镜头**: 中景 - 两人继续对话
- **时长**: 6秒
- **对话**:
  - 小雅："要不要坐下聊聊？看起来你也挺忙的。"
  - 阿明（惊喜）："真的吗？太好了！"

## 结尾
- **总时长**: 约33秒
- **情感基调**: 温馨、自然、充满希望
- **下集预告**: 两人交换联系方式，约定再次见面

---

**创作说明**：
- 突出真实自然的情感交流
- 避免过于戏剧化的情节
- 重视环境描写和氛围营造
- 角色性格通过对话和动作展现
- 适合短视频制作的镜头设计`;

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// 验证用户认证
		const session = await locals.getSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}
		
		// 创建 Supabase 客户端
		const supabase = createSupabaseBrowserClient();

		const body = await request.json();
		const { 
			project_id, 
			outline, 
			genre, 
			target_duration, 
			language, 
			model, 
			additional_requirements, 
			stream = false 
		} = body;

		// 验证必需参数
		if (!project_id || !outline) {
			throw error(400, 'project_id and outline are required');
		}

		// 验证用户对项目的访问权限
		const { data: project, error: projectError } = await supabase
			.from('projects')
			.select('id')
			.eq('id', project_id)
			.eq('user_id', session.user.id)
			.single();

		if (projectError || !project) {
			throw error(403, 'Project not found or access denied');
		}

		// 创建剧本草稿记录
		const { data: draft, error: draftError } = await supabase
			.from('screenplay_drafts')
			.insert({
				project_id,
				status: 'generating',
				outline,
				genre: genre || '短剧',
				target_duration: target_duration || '5-8分钟',
				language: language || 'zh',
				model: model || 'claude-sonnet',
				input_params: {
					additional_requirements: additional_requirements || '',
					stream
				}
			})
			.select('id')
			.single();

		if (draftError) {
			throw new Error(`Failed to create screenplay draft: ${draftError.message}`);
		}

		if (stream) {
			// 流式响应模拟
			return new Response(
				new ReadableStream({
					start(controller) {
						const encoder = new TextEncoder();
						const words = SAMPLE_SCREENPLAY.split(' ');
						let index = 0;

						const sendChunk = () => {
							if (index < words.length) {
								const content = words[index] + ' ';
								const data = JSON.stringify({ content, draft_id: draft.id });
								controller.enqueue(encoder.encode(`data: ${data}\n\n`));
								index++;
								setTimeout(sendChunk, 50); // 模拟打字效果
							} else {
								// 完成时更新数据库
								supabase
									.from('screenplay_drafts')
									.update({
										status: 'completed',
										generated_script: SAMPLE_SCREENPLAY,
										generation_info: { model, completed_at: new Date().toISOString() }
									})
									.eq('id', draft.id)
									.then(() => {
										const endData = JSON.stringify({ done: true, draft_id: draft.id });
										controller.enqueue(encoder.encode(`data: ${endData}\n\n`));
										controller.close();
									});
							}
						};

						sendChunk();
					}
				}),
				{
					headers: {
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache',
						'Connection': 'keep-alive'
					}
				}
			);

		} else {
			// 非流式响应
			// 更新数据库
			await supabase
				.from('screenplay_drafts')
				.update({
					status: 'completed',
					generated_script: SAMPLE_SCREENPLAY,
					generation_info: { model, tokens: { input_tokens: 100, output_tokens: 500 } }
				})
				.eq('id', draft.id);

			return new Response(JSON.stringify({
				success: true,
				draft_id: draft.id,
				script: SAMPLE_SCREENPLAY,
				model,
				usage: { input_tokens: 100, output_tokens: 500 }
			}), {
				headers: { 'Content-Type': 'application/json' }
			});
		}

	} catch (err) {
		console.error('Screenplay generation error:', err);
		
		if (err instanceof Error && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		throw error(500, {
			message: err instanceof Error ? err.message : 'Internal server error'
		});
	}
};