<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		value?: string;
		placeholder?: string;
		class?: string;
		rows?: number;
		disabled?: boolean;
		id?: string;
		name?: string;
	}

	let { value = $bindable(''), placeholder, class: className = '', rows = 3, disabled = false, id, name }: Props = $props();
</script>

<textarea
	{placeholder}
	{rows}
	{disabled}
	{id}
	{name}
	bind:value
	class={cn(
		'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
></textarea>
