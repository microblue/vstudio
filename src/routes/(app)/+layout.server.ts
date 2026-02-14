import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, url }) => {
	const { session, user } = await safeGetSession();

	// In dev with placeholder Supabase, allow access
	if (!session && !url.searchParams.has('dev')) {
		// Only redirect if Supabase is properly configured
		const { PUBLIC_SUPABASE_URL } = await import('$env/static/public');
		if (!PUBLIC_SUPABASE_URL.includes('placeholder')) {
			redirect(303, '/auth/login');
		}
	}

	return { session, user };
};
