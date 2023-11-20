import {AgnosUIAngularModule, createFloatingUI, floatingUI, toAngularSignal} from '@agnos-ui/angular';
import {ChangeDetectionStrategy, Component, Directive, ElementRef, afterNextRender, inject} from '@angular/core';

@Directive({
	standalone: true,
	selector: '[appScrollIntoView]',
})
export class ScrollIntoViewDirective {
	constructor() {
		const elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
		afterNextRender(() => {
			elementRef.nativeElement.scrollIntoView({block: 'center', inline: 'center'});
		});
	}
}

@Component({
	standalone: true,
	imports: [AgnosUIAngularModule, ScrollIntoViewDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="position-relative overflow-auto border border-primary-subtle floatingui-demo">
		<button
			[auUse]="floatingUI.directives.referenceDirective"
			type="button"
			class="btn btn-primary"
			(click)="displayPopover = !displayPopover"
			appScrollIntoView
		>
			Toggle popover
		</button>
		@if (displayPopover) {
			<div
				[auUse]="floatingUI.directives.floatingDirective"
				[attr.data-popper-placement]="floatingUIState().placement"
				class="popover bs-popover-auto position-absolute"
				[class.invisible]="floatingUIState().middlewareData?.hide?.referenceHidden"
				role="tooltip"
			>
				<div class="popover-arrow position-absolute" [auUse]="floatingUI.directives.arrowDirective"></div>
				<div class="popover-body">This is a sample popover</div>
			</div>
		}
	</div>`,

	styles: "@import '@agnos-ui/common/samples/floatingui/floatingui.scss';",
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
