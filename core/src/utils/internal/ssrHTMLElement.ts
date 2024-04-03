import type {SSRHTMLElement, StyleKey, StyleValue} from '../../types';
import {noop} from './func';

export const ssrHTMLElementAttributesAndStyle = Symbol('attributesAndStyle');

const spaceRegExp = /\s+/;

/**
 * Create an SSRHTMLElement
 * @returns the created SSRHTMLElement
 */
export const ssrHTMLElement = (): SSRHTMLElement => {
	const attributes: Record<string, string> = {};
	const style: Partial<Record<StyleKey, StyleValue>> = {};
	let classNames = new Set<string>();

	const toggleClass = (className: string, force = !classNames.has(className)) => {
		if (force) {
			classNames.add(className);
		} else {
			classNames.delete(className);
		}
		return !!force;
	};
	const toggleAll =
		(force: boolean) =>
		(...classNames: string[]) =>
			classNames.forEach((className) => toggleClass(className, force));

	return {
		style,
		classList: {
			add: toggleAll(true),
			remove: toggleAll(false),
			toggle: toggleClass,
		},

		setAttribute(name: string, value: string) {
			if (name === 'class') {
				classNames = new Set(...value.trim().split(spaceRegExp));
			} else {
				attributes[name] = value;
			}
		},
		removeAttribute(name: string) {
			if (name === 'class') {
				classNames = new Set();
			} else {
				delete attributes[name];
			}
		},

		addEventListener: noop,
		removeEventListener: noop,

		[ssrHTMLElementAttributesAndStyle as any]() {
			return {attributes: {...attributes}, classNames: [...classNames], style: {...style}};
		},
	};
};
