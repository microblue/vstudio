import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Use Vercel adapter
		adapter: adapter({
			// Vercel 配置选项
			runtime: 'nodejs20.x'
		})
	}
};

export default config;