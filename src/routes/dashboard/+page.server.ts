import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	// In dev with placeholder Supabase, allow access
	if (!session) {
		const { PUBLIC_SUPABASE_URL } = await import('$env/static/public');
		if (!PUBLIC_SUPABASE_URL.includes('placeholder')) {
			redirect(303, '/auth/login');
		}
	}

	return { session, user };
};