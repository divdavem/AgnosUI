import type {Directive} from '../types';
import {browserDirective} from '../utils/directive';
import {noop} from '../utils/func';
import {addEvent} from '../utils/internal/dom';

/**
 * Represents the position of the pointer after a pointerdown event.
 *
 */
export interface PointerPosition {
	/**
	 * The initial X coordinate where the pointerdown event occured.
	 */
	xOrigin: number;

	/**
	 * The initial Y coordinate where the pointerdown event occured.
	 */
	yOrigin: number;

	/**
	 * The horizontal displacement (delta X) from the origin point.
	 * Represents how far the pointer has moved horizontally since pointerdown.
	 */
	dx: number;

	/**
	 * The vertical displacement (delta X) from the origin point.
	 * Represents how far the pointer has moved vertically since pointerdown.
	 */
	dy: number;
}

/**
 * Configuration options for tracking pointer position after a pointerdown event.
 */
export interface PointerdownPositionProps {
	/**
	 * Callback function invoked when the mouse moves after a pointerdown event.
	 * @param position - The current mouse position information including origin and current coordinates.
	 */
	onMove?: (position: PointerPosition) => void;

	/**
	 * Callback function invoked when the move ends after a pointerdown event.
	 */
	onEnd?: () => void;
}

/**
 * Creates a directive for tracking pointer position during drag operations.
 *
 * This function sets up event listeners that track pointer movements from an initial pointerdown event
 * through pointermover and pointerup events. It provides a directive that can be attached to DOM elements
 * to enable drag tracking functionality.
 *
 * @param onStart - Callback function invoked when the pointerdown event happens.
 *
 * @returns The pointerdownPositionDirective that can be applied to elements.
 *
 * @example
 * ```typescript
 * const pointerPositionDirective = createPointerdownPositionDirective((position) => {
 *   console.log(`Drag started at (${position.xOrigin}, ${position.yOrigin})`);
 *   return {
 *     onMove: (position) => {
 *       console.log(`Dragging: dx=${position.dx}, dy=${position.dy}`);
 *     },
 *     onEnd: () => {
 *       console.log(`Drag ended`);
 *     }
 *   };
 * });
 * ```
 */
export const createPointerdownPositionDirective = (onStart: (position: PointerPosition) => PointerdownPositionProps | undefined): Directive =>
	browserDirective((element) => {
		interface PointerState {
			xOrigin: number;
			yOrigin: number;
			events: PointerdownPositionProps;
		}
		const activePointerIds = new Map<number, PointerState>();

		let removePointerMoveEvent = noop;
		let removePointerUpEvent = noop;
		let removePointerCancelEvent = noop;

		const removeEvents = () => {
			removePointerMoveEvent();
			removePointerUpEvent();
			removePointerCancelEvent();
			removePointerMoveEvent = noop;
			removePointerUpEvent = noop;
			removePointerCancelEvent = noop;
		};

		const addEvents = () => {
			removePointerMoveEvent = addEvent(element, 'pointermove', onMove);
			removePointerUpEvent = addEvent(element, 'pointerup', onEnd);
			removePointerCancelEvent = addEvent(element, 'pointercancel', onEnd);
		};

		const computePosition = (state: PointerState, e: PointerEvent): PointerPosition => ({
			xOrigin: state.xOrigin,
			yOrigin: state.yOrigin,
			dx: e.clientX - state.xOrigin,
			dy: e.clientY - state.yOrigin,
		});

		const onMove = (e: PointerEvent) => {
			const move = activePointerIds.get(e.pointerId);
			move?.events.onMove?.(computePosition(move, e));
		};

		const onEnd = (e: PointerEvent) => {
			const pointerId = e.pointerId;
			const move = activePointerIds.get(pointerId);
			activePointerIds.delete(pointerId);
			if (activePointerIds.size === 0) {
				removeEvents();
			}
			move?.events.onEnd?.();
		};

		const removePointerDownEvent = addEvent(element, 'pointerdown', (e: PointerEvent) => {
			const pointerId = e.pointerId;
			let existingMove = activePointerIds.get(pointerId);
			if (existingMove) {
				// maybe this cannot happen, but we include the code to be sure of consistency
				onEnd(e);
			} else {
				element.setPointerCapture(pointerId);
			}
			existingMove = {
				xOrigin: e.clientX,
				yOrigin: e.clientY,
				events: {},
			};
			const startResult = onStart(computePosition(existingMove, e));
			if (startResult) {
				existingMove.events = startResult;
				if (activePointerIds.size === 0) {
					addEvents();
				}
				activePointerIds.set(pointerId, existingMove);
			}
		});

		return {
			destroy() {
				removePointerDownEvent();
				removeEvents();
				for (const [, {events}] of activePointerIds) {
					events?.onEnd?.();
				}
			},
		};
	});
