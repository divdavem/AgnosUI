import {computed} from '@amadeus-it-group/tansu';
import type {Directive} from '../types';
import {registrationArray} from './directiveUtils';
import {isFocusable} from './isFocusable';
import {compareDomOrder} from './sortUtils';
import {getTextDirection} from './textDirection';

export type NavManager = ReturnType<typeof createNavManager>;

// cf https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
const textInputTypes = new Set(['text', 'search', 'url', 'tel', 'password']);
const isTextInput = (element: any): element is HTMLInputElement => element instanceof HTMLInputElement && textInputTypes.has(element.type);

/**
 * Returns the key name given the keyboard event.
 * If present, modifiers are always in the same order: Meta+Ctrl+Alt+Shift+...
 * @param event - keyboard event
 * @returns the name of the key, including modifiers
 */
export const getKeyName = (event: KeyboardEvent) => {
	let key = event.key;
	if (event.shiftKey) {
		key = `Shift+${key}`;
	}
	if (event.altKey) {
		key = `Alt+${key}`;
	}
	if (event.ctrlKey) {
		key = `Ctrl+${key}`;
	}
	if (event.metaKey) {
		key = `Meta+${key}`;
	}
	return key;
};

/**
 * Returns true if the keyboard event is an ArrowLeft, ArrowRight, Home or End key press that should make the cursor move inside
 * the input and false otherwise (i.e. the key is not ArrowLeft, ArrowRight, Home or End key, or that would not make the cursor move
 * because it is already at one end of the input)
 * @param event - keyboard event
 * @returns true if the keyboard event is an ArrowLeft, ArrowRight, Home or End key press that should make the cursor move inside
 * the input and false otherwise.
 */
export const isInternalInputNavigation = (event: KeyboardEvent) => {
	const {target, key} = event;
	if (isTextInput(target) && (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End')) {
		let startPosition: boolean;
		if (key === 'ArrowLeft' || key === 'ArrowRight') {
			const direction = getTextDirection(target);
			startPosition = key === (direction === 'ltr' ? 'ArrowLeft' : 'ArrowRight');
		} else {
			startPosition = key === 'Home';
		}
		const cursorPosition = target.selectionStart === target.selectionEnd ? target.selectionStart : null;
		if ((startPosition && cursorPosition !== 0) || (!startPosition && cursorPosition !== target.value.length)) {
			// let the text input process the key
			return true;
		}
	}
	return false;
};

export type NavManagerKeyHandler = (info: {element: HTMLElement; event: KeyboardEvent; navManager: NavManager}) => void;

export interface NavManagerItemConfig {
	/**
	 * Handler for each key
	 */
	keys?: Record<string, NavManagerKeyHandler>;
}

const computeCommonAncestor = (elements: HTMLElement[]) => {
	const length = elements.length;
	if (length === 0) return null;
	let ancestor: HTMLElement | null = elements[0];
	for (let i = 1; i < length && ancestor; i++) {
		const element = elements[i];
		while (ancestor && !(ancestor.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
			ancestor = ancestor.parentElement;
		}
	}
	return ancestor;
};

export const createNavManager = () => {
	const elements$ = registrationArray<HTMLElement>();
	const commonAncestor$ = computed(() => computeCommonAncestor(elements$()), {equal: Object.is});
	const elementsInDomOrder$ = computed(() => [...elements$()].sort(compareDomOrder));

	const ancestorDirection = () => {
		const commonAncestor = commonAncestor$();
		return commonAncestor ? getTextDirection(commonAncestor) : 'ltr';
	};

	const preventDefaultIfRelevant = (value: HTMLElement | null, event?: KeyboardEvent) => {
		if (value) {
			event?.preventDefault();
		}
		return value;
	};

	const focusIndex = (index: number, moveDirection: -1 | 0 | 1 = 0): HTMLElement | null => {
		const array = elementsInDomOrder$();
		while (index >= 0 && index < array.length) {
			const newItem = array[index];
			if (isFocusable(newItem)) {
				newItem.focus();
				if (moveDirection != 0 && isTextInput(newItem)) {
					const changeDirection = ancestorDirection() !== getTextDirection(newItem);
					const position = moveDirection > 0 !== changeDirection ? 0 : newItem.value.length;
					newItem.setSelectionRange(position, position, position === 0 ? 'forward' : 'backward');
				}
				return newItem;
			}
			if (moveDirection === 0) {
				break;
			} else {
				index += moveDirection;
			}
		}
		return null;
	};

	const createFocusNeighbour =
		(moveDirection: 1 | -1) =>
		({
			event,
			element = (event?.target as HTMLElement) ?? document.activeElement,
		}: {
			event?: KeyboardEvent;
			element?: HTMLElement | null;
		} = {}): HTMLElement | null => {
			const curIndex = element ? elementsInDomOrder$().indexOf(element) : -1;
			if (curIndex > -1) {
				return preventDefaultIfRelevant(focusIndex(curIndex + moveDirection, moveDirection), event);
			}
			return null;
		};

	const directive: Directive<NavManagerItemConfig> = (element, config) => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (isInternalInputNavigation(event)) {
				return;
			}
			const keyName = getKeyName(event);
			const handler = config.keys?.[keyName];
			handler?.({event, element, navManager});
		};
		element.addEventListener('keydown', onKeyDown);
		const unregister = elements$.register(element);
		return {
			update(newConfig) {
				config = newConfig;
			},
			destroy() {
				element.removeEventListener('keydown', onKeyDown);
				unregister();
			},
		};
	};

	const focusPrevious = createFocusNeighbour(-1);
	const focusNext = createFocusNeighbour(1);
	const focusFirst = ({event}: {event?: KeyboardEvent} = {}) => preventDefaultIfRelevant(focusIndex(0, 1), event);
	const focusLast = ({event}: {event?: KeyboardEvent} = {}) => preventDefaultIfRelevant(focusIndex(elementsInDomOrder$().length - 1, -1), event);
	const focusLeft = (...args: Parameters<typeof focusNext>) => (ancestorDirection() === 'rtl' ? focusNext : focusPrevious)(...args);
	const focusRight = (...args: Parameters<typeof focusNext>) => (ancestorDirection() === 'rtl' ? focusPrevious : focusNext)(...args);

	const navManager = {
		elementsInDomOrder$,
		directive,
		focusIndex,
		focusPrevious,
		focusNext,
		focusFirst,
		focusLast,
		focusLeft,
		focusRight,
	};
	return navManager;
};
