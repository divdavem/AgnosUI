<script lang="ts">
	import {createFloatingUI, floatingUI} from '@agnos-ui/core';

	const {
		directives: {floatingDirective, referenceDirective, arrowDirective},
		stores: {placement$, floatingStyle$, arrowStyle$, middlewareData$},
	} = createFloatingUI({
		props: {
			arrowOptions: {
				padding: 6,
			},
			computePositionOptions: {
				middleware: [
					floatingUI.offset(10),
					floatingUI.autoPlacement(),
					floatingUI.shift({
						padding: 5,
					}),
					floatingUI.hide(),
				],
			},
		},
	});

	let displayPopover = true;
	const toggleButton = () => {
		displayPopover = !displayPopover;
	};

	const scrollIntoView = (element: HTMLElement) => {
		element.scrollIntoView({block: 'center', inline: 'center'});
	};
</script>

<div class="position-relative overflow-auto border border-primary-subtle floatingui-demo">
	<button use:referenceDirective type="button" class="btn btn-primary" on:click={toggleButton} use:scrollIntoView>Toggle popover</button>
	{#if displayPopover}
		<div
			use:floatingDirective
			data-popper-placement={$placement$}
			class="popover bs-popover-auto fade position-absolute"
			class:show={!$middlewareData$?.hide?.referenceHidden}
			role="tooltip"
			style={$floatingStyle$}
		>
			<div class="popover-arrow position-absolute" use:arrowDirective style={$arrowStyle$}></div>
			<div class="popover-body">This is a sample popover</div>
		</div>
	{/if}
</div>

<style>
	div.floatingui-demo {
		width: 500px;
		height: 200px;
	}
	button {
		margin: 500px;
	}
	button,
	.popover {
		width: max-content;
	}
</style>
