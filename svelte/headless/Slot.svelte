<script lang="ts">
	import type {SlotContent} from './slotTypes';
	import {isSvelteComponent, isSvelteSnippet} from './utils';

	type Props = $$Generic<object>; // eslint-disable-line no-undef
	let {slotContent = null, props} = $props<{
		slotContent: SlotContent<Props>;
		props: Props;
	}>();
</script>

{#if isSvelteSnippet(slotContent)}
	{@render slotContent(props)}
{:else if isSvelteComponent(slotContent)}
	<svelte:component this={slotContent} {...props} />
{:else if typeof slotContent === 'string'}
	{slotContent}
{:else if slotContent}
	{slotContent(props)}
{/if}
