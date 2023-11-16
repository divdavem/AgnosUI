import {createFloatingUI, floatingUI, useDirective, useObservable} from '@agnos-ui/react';
import {useMemo, useState} from 'react';

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
	const floatingUIState = useObservable(floatingUIInstance.state$);
	const refReference = useDirective(floatingUIInstance.directives.referenceDirective);
	const refFloating = useDirective(floatingUIInstance.directives.floatingDirective);
	const refArrow = useDirective(floatingUIInstance.directives.arrowDirective);

	return (
		<div className="position-relative overflow-auto border border-primary-subtle floatingui-demo" style={{width: '500px', height: '200px'}}>
			<button
				ref={refReference}
				type="button"
				className="btn btn-primary"
				onClick={() => setDisplayPopover(!displayPopover)}
				style={{margin: '500px', width: 'max-content'}}
			>
				Toggle popover
			</button>
			{displayPopover ? (
				<div
					ref={refFloating}
					data-popper-placement={floatingUIState.placement}
					className={`popover bs-popover-auto fade position-absolute ${!floatingUIState.middlewareData?.hide?.referenceHidden ? 'show' : ''}`}
					style={{width: 'max-content'}}
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
