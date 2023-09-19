import type {TransitionFn} from './baseTransitions.js';
import {promiseFromEvent, promiseFromTimeout} from './utils.js';

/**
 * Check if the provided html element has a transition
 * @param element - the html element
 * @returns true if the element has a transition
 */
export function hasTransition(element: HTMLElement): boolean {
	return window.getComputedStyle(element).transitionProperty !== 'none';
}

/**
 * Retrieve the transition duration of the provided html element in milli seconds
 * @param element - the html element
 * @returns transition duration in milli seconds
 */
export function getTransitionDurationMs(element: HTMLElement): number {
	const {transitionDelay, transitionDuration} = window.getComputedStyle(element);
	const transitionDelaySec = parseFloat(transitionDelay);
	const transitionDurationSec = parseFloat(transitionDuration);

	return (transitionDelaySec + transitionDurationSec) * 1000;
}

const noop = () => {
	/* do nothing */
};

export type CSSTransitionFn = (element: HTMLElement, direction: 'show' | 'hide', animation: boolean, context: object) => void | (() => void);

export const createCSSTransition =
	(start: CSSTransitionFn): TransitionFn =>
	async (element, direction, animation, signal, context) => {
		const endFn = start(element, direction, animation, context) ?? noop;

		if (animation && hasTransition(element)) {
			const abort = promiseFromEvent(signal, 'abort');
			const transitionEnd = promiseFromEvent(element, 'transitionend');
			const timer = promiseFromTimeout(getTransitionDurationMs(element));

			await Promise.race([abort.promise, transitionEnd.promise, timer.promise]);

			abort.unsubscribe();
			transitionEnd.unsubscribe();
			timer.unsubscribe();
		}
		if (!signal.aborted) {
			endFn();
		}
	};
