<script lang="ts">
	import NavManagerSample from './NavManagerSample.svelte';

	let selectionPosition: null | {start: number; end: number} = null;
	const syncUpdateSelectionPosition = () => {
		const activeElement = document.activeElement;
		selectionPosition =
			activeElement instanceof HTMLInputElement && activeElement.selectionStart !== null && activeElement.selectionEnd !== null
				? {
						start: activeElement.selectionStart,
						end: activeElement.selectionEnd,
				  }
				: null;
	};
	const laterUpdateSelectionPosition = () => setTimeout(syncUpdateSelectionPosition, 1);
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:keydown={laterUpdateSelectionPosition}
	on:focusin={laterUpdateSelectionPosition}
	on:focusout={laterUpdateSelectionPosition}
	on:mousedown={laterUpdateSelectionPosition}
	on:mouseup={laterUpdateSelectionPosition}
>
	<div dir="ltr" class="mt-3 pb-3">
		<h2>Left-to-right</h2>
		<NavManagerSample />
	</div>

	<div dir="rtl" class="mt-3 pb-3">
		<h2>Right-to-left</h2>
		<NavManagerSample />
	</div>
</div>
<div class="mt-3">
	Some hebrew text: {'\u05e9\u05c1\u05b8\u05dc\u05d5\u05b9\u05dd'}
</div>

{#if selectionPosition}
	<div class="mt-3">Selection position: {selectionPosition.start}-{selectionPosition.end}</div>
{/if}
