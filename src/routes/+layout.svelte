<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase';

	let { data, children } = $props();
	let supabase = createSupabaseBrowserClient();

	onMount(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth');
		});
		return () => subscription.unsubscribe();
	});
</script>

<div class="min-h-screen">
	{@render children()}
</div>
