import {AgnosUIAngularModule, createFloatingUI, floatingUI, toAngularSignal} from '@agnos-ui/angular';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
	standalone: true,
	imports: [AgnosUIAngularModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="position-relative overflow-auto border border-primary-subtle floatingui-demo">
		<button [auUse]="floatingUI.directives.referenceDirective" type="button" class="btn btn-primary" (click)="displayPopover = !displayPopover">
			Toggle popover
		</button>
		@if (displayPopover) {
			<div
				[auUse]="floatingUI.directives.floatingDirective"
				[attr.data-popper-placement]="floatingUIState().placement"
				class="popover bs-popover-auto fade position-absolute"
				[class.show]="!floatingUIState().middlewareData?.hide?.referenceHidden"
				role="tooltip"
				[style]="floatingUIState().floatingStyle"
			>
				<div class="popover-arrow position-absolute" [auUse]="floatingUI.directives.arrowDirective" [style]="floatingUIState().arrowStyle"></div>
				<div class="popover-body">This is a sample popover</div>
			</div>
		}
	</div>`,

	styles: `
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
	`,
})
export default class FloatingUIComponent {
	displayPopover = true;

	floatingUI = createFloatingUI({
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
	floatingUIState = toAngularSignal(this.floatingUI.state$);
}
