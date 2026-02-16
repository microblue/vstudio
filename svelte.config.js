import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Use Cloudflare Pages adapter
		adapter: adapter({
			// Cloudflare 配置选项
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		})
	}
};

export default config;