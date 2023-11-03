<script lang="ts">
	import type {NavManagerItemConfig} from '@agnos-ui/core';
	import {createNavManager} from '@agnos-ui/core';

	export let dir: 'rtl' | 'ltr' = 'ltr';

	const {directive, focusPrevious, focusNext} = createNavManager();
	let divElement: HTMLDivElement;

	let inputElement: HTMLInputElement;
	let selectionStart: number | null = null;
	let selectionEnd: number | null = null;
	const updateSelection = () => {
		selectionStart = inputElement.selectionStart;
		selectionEnd = inputElement.selectionEnd;
	};

	const keydown = () => {
		setTimeout(updateSelection);
	};

	const setPosition = () => {
		inputElement.focus();
		inputElement.setSelectionRange(2, 2);
		setTimeout(updateSelection);
	};

	$: navManagerConfig = {
		keys:
			dir === 'ltr'
				? {
						ArrowLeft: focusPrevious,
						ArrowRight: focusNext,
				  }
				: {
						ArrowLeft: focusNext,
						ArrowRight: focusPrevious,
				  },
	} satisfies NavManagerItemConfig;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div bind:this={divElement} {dir} on:keydown={keydown}>
	<span use:directive={navManagerConfig} tabindex="-1">1</span>
	<span use:directive={navManagerConfig} tabindex="-1">2</span>
	<input use:directive={navManagerConfig} type="text" bind:this={inputElement} value="שָׁלוֹם abc שָׁלוֹם" />
	<span use:directive={navManagerConfig} tabindex="-1">3</span>
	<span use:directive={navManagerConfig} tabindex="-1">4</span>
	<input use:directive={navManagerConfig} type="text" disabled />
	<input use:directive={navManagerConfig} type="checkbox" disabled />
	<span use:directive={navManagerConfig} tabindex="-1">5</span>
</div>

<button on:click={setPosition}>setPosition</button>
<div>Selection: {selectionStart}-{selectionEnd}</div>

<style>
	*:focus {
		outline: 2px solid red;
	}
</style>
