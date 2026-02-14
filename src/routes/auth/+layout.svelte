<script lang="ts">
	let { children } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/50">
	<div class="w-full max-w-md p-4">
		{@render children()}
	</div>
</div>
