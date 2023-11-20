import {createFloatingUI, floatingUI, mergeDirectives, useDirective, useObservable} from '@agnos-ui/react';
import {useMemo, useState} from 'react';
import '@agnos-ui/common/samples/floatingui/floatingui.scss';

const scrollIntoView = (element: HTMLElement) => {
	element.scrollIntoView({block: 'center', inline: 'center'});
};

const FloatingUI = () => {
	const [displayPopover, setDisplayPopover] = useState(true);
	const floatingUIInstance = useMemo(
		() =>
			createFloatingUI({
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
			}),
		[],
	);
	const referenceDirective = useMemo(() => mergeDirectives(floatingUIInstance.directives.referenceDirective, scrollIntoView), []);
	const floatingUIState = useObservable(floatingUIInstance.state$);
	const refReference = useDirective(referenceDirective);
	const refFloating = useDirective(floatingUIInstance.directives.floatingDirective);
	const refArrow = useDirective(floatingUIInstance.directives.arrowDirective);

	return (
		<div className="position-relative overflow-auto border border-primary-subtle floatingui-demo">
			<button ref={refReference} type="button" className="btn btn-primary" onClick={() => setDisplayPopover(!displayPopover)}>
				Toggle popover
			</button>
			{displayPopover ? (
				<div
					ref={refFloating}
					data-popper-placement={floatingUIState.placement}
					className={`popover bs-popover-auto position-absolute ${floatingUIState.middlewareData?.hide?.referenceHidden ? 'invisible' : ''}`}
					role="tooltip"
				>
					<div className="popover-arrow position-absolute" ref={refArrow}></div>
					<div className="popover-body">This is a sample popover</div>
				</div>
			) : null}
		</div>
	);
};
export default FloatingUI;
