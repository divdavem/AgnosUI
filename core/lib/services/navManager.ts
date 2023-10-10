import {computed} from '@amadeus-it-group/tansu';
import type {Directive} from '../types';
import {registrationArray} from './directiveUtils';
import {compareDomOrder} from './sortUtils';
import {getTextDirection} from './textDirection';
import {isFocusable} from './isFocusable';

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
 * Returns true if the keyboard event is an ArrowLeft or ArrowRight key press that should make the cursor move inside
 * the input and false otherwise (i.e. the key is not ArrowLeft or ArrowRight, or that would not make the cursor move
 * because it is already at one end of the input)
 * @param event - keyboard event
 * @returns true if the keyboard event is an ArrowLeft or ArrowRight key press that should the cursor move inside
 * the input and false otherwise.
 */
export const isInternalInputNavigation = (event: KeyboardEvent) => {
	if (isTextInput(event.target) && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
		let startPosition = event.key === 'ArrowLeft';
		if (getTextDirection(event.target) === 'rtl') {
			startPosition = !startPosition;
		}
		const cursorPosition = event.target.selectionStart === event.target.selectionEnd ? event.target.selectionStart : null;
		if ((startPosition && cursorPosition !== 0) || (!startPosition && cursorPosition !== event.target.value.length)) {
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

export const createNavManager = () => {
	const elements$ = registrationArray<HTMLElement>();
	const elementsInDomOrder$ = computed(() => [...elements$()].sort(compareDomOrder));

	const focusIndex = (index: number, moveDirection: -1 | 0 | 1 = 0): HTMLElement | null => {
		const array = elementsInDomOrder$();
		while (index >= 0 && index < array.length) {
			const newItem = array[index];
			if (isFocusable(newItem)) {
				newItem.focus();
				if (moveDirection != 0 && isTextInput(newItem)) {
					const position = moveDirection > 0 ? 0 : newItem.value.length;
					newItem.setSelectionRange(position, position);
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
				const res = focusIndex(curIndex + moveDirection, moveDirection);
				if (res) {
					event?.preventDefault();
				}
				return res;
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

	const navManager = {
		elementsInDomOrder$,
		directive,
		focusIndex,
		focusNext: createFocusNeighbour(1),
		focusPrevious: createFocusNeighbour(-1),
		focusFirst: () => focusIndex(0, 1),
		focusLast: () => focusIndex(elementsInDomOrder$().length - 1, -1),
	};
	return navManager;
};
