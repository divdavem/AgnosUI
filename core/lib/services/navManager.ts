import type {Directive} from '../types';
import {compareDomOrder} from './arrayUtils';
import {registrationArray} from './directiveUtils';
import type {PropsConfig} from './stores';

export interface NavElement {
	/**
	 *
	 */
	element: HTMLElement;
}

export interface NavManagerProps {}

export type NavManager = ReturnType<typeof createNavManager>;

const compareNavElement = (navElement1: NavElement, navElement2: NavElement) => compareDomOrder(navElement1.element, navElement2.element);

export const createNavManager = (propsConfig?: PropsConfig<NavManagerProps>) => {
	const array$ = registrationArray<NavElement>(compareNavElement);
	const directive: Directive = (element) => {
		const navElement: NavElement = {element};
		const onKeyDown = (event: KeyboardEvent) => {
			let move = 0;
			switch (event.key) {
				case 'ArrowLeft':
					move = -1;
					break;
				case 'ArrowRight':
					move = 1;
					break;
			}
			if (event.target instanceof HTMLInputElement) {
				const cursorPosition = event.target.selectionStart === event.target.selectionEnd ? event.target.selectionStart : null;
				if ((cursorPosition !== 0 && move < 0) || (cursorPosition !== event.target.value.length && move > 0)) {
					move = 0;
				}
			}
			if (move != 0) {
				const array = array$();
				const currentIndex = array.indexOf(navElement);
				const newIndex = currentIndex + move;
				if (newIndex < array.length && newIndex >= 0) {
					const newItem = array[newIndex];
					event.preventDefault();
					newItem.element.focus();
					if (newItem.element instanceof HTMLInputElement) {
						const position = move < 0 ? newItem.element.value.length : 0;
						newItem.element.setSelectionRange(position, position, 'none');
					}
				}
			}
		};
		element.addEventListener('keydown', onKeyDown);
		const destroy = array$.register(navElement);
		return {
			destroy() {
				element.removeEventListener('keydown', onKeyDown);
				destroy();
			},
		};
	};

	return {directive};
};
