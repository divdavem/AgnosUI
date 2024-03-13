import App from './App.svelte';

export function render() {
	// @ts-expect-error Property 'render' does not exist on type 'typeof App__SvelteComponent_'.
	return App.render();
}
