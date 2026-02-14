import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) error(401, 'Unauthorized');

	const { data: project } = await supabase
		.from('projects')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!project) error(404, 'Project not found');

	const { data: episodes } = await supabase
		.from('episodes')
		.select('*')
		.eq('project_id', params.id)
		.order('episode_number');

	return { project, episodes: episodes ?? [] };
};
