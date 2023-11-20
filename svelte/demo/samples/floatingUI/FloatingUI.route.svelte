<script lang="ts">
	import {createFloatingUI, floatingUI} from '@agnos-ui/core';
	import '@agnos-ui/common/samples/floatingui/floatingui.scss';

	const {
		directives: {floatingDirective, referenceDirective, arrowDirective},
		stores: {placement$, middlewareData$},
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
			class="popover bs-popover-auto position-absolute"
			class:invisible={$middlewareData$?.hide?.referenceHidden}
			role="tooltip"
		>
			<div class="popover-arrow position-absolute" use:arrowDirective></div>
			<div class="popover-body">This is a sample popover</div>
		</div>
	{/if}
</div>
