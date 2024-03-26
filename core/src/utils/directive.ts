import type {ReadableSignal} from '@amadeus-it-group/tansu';
import {asReadable, batch, readable, writable} from '@amadeus-it-group/tansu';
import {BROWSER} from 'esm-env';
import type {AttributeValue, Directive, SSRExecutableDirective, SSRCompatibleDirective, SSRHTMLElement, StyleKey, StyleValue} from '../types';
import {addEvent, bindAttribute, bindClassName, bindStyle} from './internal/dom';
import {noop} from './internal/func';
import {ssrHTMLElement, ssrHTMLElementAttributesAndStyle} from './internal/ssrHTMLElement';
import {toReadableStore} from './stores';

/**
 * Returns true if the given directive is an SSRExecutableDirective.
 * @param directive - directive to check
 * @returns true if the directive is an SSRExecutableDirective, false otherwise.
 */
export const isSSRExecutableDirective = <T, U extends SSRHTMLElement>(directive: Directive<T, U>): directive is SSRExecutableDirective<T, U> =>
	!!(directive as any).ssr;

/**
 * Returns true if the given directive is an SSRExecutableDirective that has the same implementation for SSR and CSR.
 * @param directive - directive to check
 * @returns true if the directive is an SSRExecutableDirective with the same implementation for SSR and CSR, false otherwise.
 */
export const isSelfSSRExecutableDirective = <T, U extends SSRHTMLElement>(
	directive: Directive<T, U>,
): directive is SSRExecutableDirective<T, SSRHTMLElement> => directive === (directive as any).ssr;

export function makeSSRExecutable<T>(
	directive: SSRCompatibleDirective<T>,
	ssrDirective?: SSRCompatibleDirective<T>,
): SSRExecutableDirective<T, SSRHTMLElement>;

export function makeSSRExecutable<T, U extends SSRHTMLElement>(
	directive: Directive<T, U>,
	ssrDirective: SSRCompatibleDirective<T>,
): SSRExecutableDirective<T, U>;

/**
 * Makes the given directive an SSRExecutableDirective.
 * @param directive - directive to make an SSRExecutableDirective
 * @param ssrDirective - directive to execute server-side, if different from the directive
 * @returns input directive after its ssr property has been set
 */
export function makeSSRExecutable<T, U extends SSRHTMLElement>(
	directive: Directive<T, U>,
	ssrDirective?: SSRCompatibleDirective<T>,
): SSRExecutableDirective<T, U> {
	const res = directive as SSRExecutableDirective<T, U>;
	res.ssr = ssrDirective ?? (res as any);
	return res;
}

/**
 * Binds the given directive to a store that provides its argument.
 *
 * @remarks
 *
 * The returned directive can be used without argument, it will ignore any argument passed to it
 * and will call the provided directive with the content of the provided store as its argument,
 * calling its update method when the content of the store changes.
 *
 * @param directive - directive to bind
 * @param directiveArg$ - store containing the argument of the directive
 * @returns The bound directive that can be used with no argument.
 */
export const bindDirective = <T, U extends SSRHTMLElement = HTMLElement>(
	directive: Directive<T, U>,
	directiveArg$: ReadableSignal<T>,
): Directive<void, U> => {
	const res: Directive<void, U> = (element) => {
		let firstTime = true;
		let instance: ReturnType<Directive<T, U>> | undefined;
		const unsubscribe = directiveArg$.subscribe((value) => {
			if (firstTime) {
				firstTime = false;
				instance = directive(element, value);
			} else {
				instance?.update?.(value);
			}
		});
		return {
			destroy() {
				instance?.destroy?.();
				unsubscribe();
			},
		};
	};
	return isSSRExecutableDirective(directive)
		? makeSSRExecutable(
				res,
				isSelfSSRExecutableDirective(directive) ? (res as SSRCompatibleDirective<void>) : bindDirective(directive.ssr, directiveArg$),
			)
		: res;
};

const noArg = readable(undefined);

/**
 * Returns a directive that ignores any argument passed to it and calls the provided directive without any
 * argument.
 *
 * @param directive - directive to wrap
 * @returns The resulting directive.
 */
export const bindDirectiveNoArg = <T, U extends SSRHTMLElement = HTMLElement>(directive: Directive<T | void, U>) => bindDirective(directive, noArg);

/**
 * Maps the argument to another argument of a directive using a provided function.
 *
 * @param directive - The directive to be applied.
 * @param fn - The function to map the argument.
 * @returns A new directive that applies the mapping function to the argument.
 */
export const mapDirectiveArg = <T, U, V extends SSRHTMLElement = HTMLElement>(directive: Directive<U, V>, fn: (arg: T) => U): Directive<T, V> => {
	const res: Directive<T, V> = (node, arg) => {
		const instance = directive(node, fn(arg));
		return {
			update: (arg) => {
				instance?.update?.(fn(arg));
			},
			destroy: () => instance?.destroy?.(),
		};
	};
	return isSSRExecutableDirective(directive)
		? makeSSRExecutable(res, isSelfSSRExecutableDirective(directive) ? (res as SSRCompatibleDirective<T>) : mapDirectiveArg(directive.ssr, fn))
		: res;
};
/**
 * Returns a directive that subscribes to the given store while it is used on a DOM element,
 * and that unsubscribes from it when it is no longer used.
 *
 * @param store - store on which there will be an active subscription while the returned directive is used.
 * @param asyncUnsubscribe - true if unsubscribing from the store should be done asynchronously (which is the default), and
 * false if it should be done synchronously when the directive is destroyed
 * @returns The resulting directive.
 */
export const directiveSubscribe =
	(store: ReadableSignal<any>, asyncUnsubscribe = true): SSRCompatibleDirective =>
	() => {
		const unsubscribe = store.subscribe(noop);
		return {
			destroy: async () => {
				if (asyncUnsubscribe) {
					await 0;
				}
				unsubscribe();
			},
		};
	};

/**
 * Returns a directive that calls the provided function with the arguments passed to the directive
 * on initialization and each time they are updated.
 *
 * @param update - Function called with the directive argument when the directive is initialized and when its argument is updated.
 * @returns The resulting directive.
 */
export const directiveUpdate =
	<T>(update: (arg: T) => void): SSRCompatibleDirective<T> =>
	(element, arg) => {
		update(arg);
		return {
			update,
		};
	};

const equalOption = {equal: Object.is};

/**
 * Utility to create a store that contains an array of items.
 * @returns a store containing an array of items.
 */
export const registrationArray = <T>(): ReadableSignal<T[]> & {register: (element: T) => () => void} => {
	const elements$ = writable([] as T[], equalOption);
	return asReadable(elements$, {
		/**
		 * Add the given element to the array.
		 * @param element - Element to be added to the array.
		 * @returns A function to remove the element from the array.
		 */
		register: (element: T) => {
			let removed = false;
			elements$.update((currentElements) => [...currentElements, element]);
			return () => {
				if (!removed) {
					removed = true;
					elements$.update((currentElements) => {
						const index = currentElements.indexOf(element);
						if (index > -1) {
							const copy = [...currentElements];
							copy.splice(index, 1);
							return copy;
						}
						return currentElements; // no change
					});
				}
			};
		},
	});
};

/**
 * Returns a directive and a store. The store contains at any time the array of all the DOM elements on which the directive is
 * currently used.
 *
 * @remarks
 * If the directive is intended to be used on a single element element, it may be more appropriate to use
 * {@link createStoreDirective} instead.
 *
 * @returns An object with two properties: the `directive` property that is the directive to use on some DOM elements,
 * and the `elements$` property that is the store containing an array of all the elements on which the directive is currently
 * used.
 */
export const createStoreArrayDirective = (): {directive: Directive; elements$: ReadableSignal<HTMLElement[]>} => {
	const elements$ = registrationArray<HTMLElement>();
	return {
		elements$: asReadable(elements$),
		directive: (element) => ({destroy: elements$.register(element)}),
	};
};

/**
 * Returns a directive and a store. When the directive is used on a DOM element, the store contains that DOM element.
 * When the directive is not used, the store contains null.
 *
 * @remarks
 * If the directive is used on more than one element, an error is displayed in the console and the element is ignored.
 * If the directive is intended to be used on more than one element, please use {@link createStoreArrayDirective} instead.
 *
 * @returns An object with two properties: the `directive` property that is the directive to use on one DOM element,
 * and the `element$` property that is the store containing the element on which the directive is currently used (or null
 * if the store is not currently used).
 */
export const createStoreDirective = (): {directive: Directive; element$: ReadableSignal<HTMLElement | null>} => {
	const element$ = writable(null as HTMLElement | null, equalOption);
	return {
		element$: asReadable(element$),
		directive: (element) => {
			let valid = false;
			element$.update((currentElement) => {
				if (currentElement) {
					console.error('The directive cannot be used on multiple elements.', currentElement, element);
					return currentElement;
				}
				valid = true;
				return element;
			});
			return valid
				? {
						destroy() {
							element$.update((currentElement) => (element === currentElement ? null : currentElement));
						},
					}
				: undefined;
		},
	};
};

/**
 * Merges multiple directives into a single directive that executes all of them when called.
 *
 * @remarks
 * All directives receive the same argument upon initialization and update.
 * Directives are created and updated in the same order as they appear in the arguments list,
 * they are destroyed in the reverse order.
 * All calls to the directives (to create, update and destroy them) are wrapped in a call to the
 * batch function of tansu
 *
 * @param args - directives to merge into a single directive.
 * @returns The resulting merged directive.
 */
export const mergeDirectives = <T, U extends SSRHTMLElement = HTMLElement>(...args: (Directive<T, U> | Directive<void, U>)[]): Directive<T, U> => {
	const res: Directive<T, U> = (element, arg) => {
		const instances = batch(() => args.map((directive) => directive(element, arg as any)));
		return {
			update(arg) {
				batch(() => instances.forEach((instance) => instance?.update?.(arg as any)));
			},
			destroy() {
				batch(() => instances.reverse().forEach((instance) => instance?.destroy?.()));
			},
		};
	};
	const ssrDirectives = (args as Directive<T, U>[]).filter(isSSRExecutableDirective).map((directive) => directive.ssr);
	return ssrDirectives.length > 0
		? makeSSRExecutable(
				res,
				ssrDirectives.length === args.length && (args as Directive<T, U>[]).every(isSelfSSRExecutableDirective)
					? (res as SSRCompatibleDirective<T>)
					: mergeDirectives(...ssrDirectives),
			)
		: res;
};

/**
 * Properties for configuring server-side rendering directives.
 */
export interface AttributesDirectiveProps {
	/**
	 * Events to be attached to an HTML element.
	 * @remarks
	 * Key-value pairs where keys are event types and values are event handlers.
	 */
	events?: Partial<{
		[K in keyof HTMLElementEventMap]:
			| {
					handler: (this: HTMLElement, event: HTMLElementEventMap[K]) => void;
					options?: boolean | AddEventListenerOptions;
			  }
			| ((this: HTMLElement, event: HTMLElementEventMap[K]) => void);
	}>;

	/**
	 * Attributes to be added to the provided node.
	 * @remarks
	 * The `style` attribute must be added separately.
	 */
	attributes?: Record<string, AttributeValue | ReadableSignal<AttributeValue>>;

	/**
	 * Styles to be added to an HTML element.
	 * @remarks
	 * Key-value pairs where keys are CSS style properties and values are style values.
	 */
	styles?: Partial<Record<StyleKey, StyleValue | ReadableSignal<StyleValue>>>;

	/**
	 * Class names to be added to an HTML element.
	 * @remarks
	 * Key-value pairs where keys are class names and values indicate whether the class should be added (true) or removed (false).
	 */
	classNames?: Record<string, boolean | ReadableSignal<boolean>>;
}

/**
 * Creates a directive for server-side rendering with bindable elements.
 * This directive binds events, attributes, styles, and classNames to an HTML element.
 *
 * @param propsFn - A function that returns the AttributesDirectiveProps with the data to bind.
 * This function can take an optional parameter that corrspond to the second parameter of the created directive.
 * @returns A directive object with bound events, attributes, styles, and classNames.
 */
export const createAttributesDirective = <T = void>(propsFn: (arg: ReadableSignal<T>) => AttributesDirectiveProps) =>
	makeSSRExecutable((node, args: T) => {
		const unsubscribers: (() => void)[] = [];
		const args$ = writable(args);

		const {events, attributes, styles, classNames} = propsFn(args$);

		if (BROWSER) {
			for (const [type, event] of Object.entries(events ?? {})) {
				if (typeof event === 'function') {
					unsubscribers.push(addEvent(node, type as keyof HTMLElementEventMap, event as any));
				} else {
					unsubscribers.push(addEvent(node, type as keyof HTMLElementEventMap, event.handler as any, event.options));
				}
			}
		}

		for (const [attributeName, value] of Object.entries(attributes ?? {})) {
			if (value != null) {
				unsubscribers.push(bindAttribute(node, attributeName, toReadableStore(value)));
			}
		}

		for (const [styleName, value] of Object.entries(styles ?? {}) as Iterable<[StyleKey, StyleValue | ReadableSignal<StyleValue>]>) {
			if (value) {
				unsubscribers.push(bindStyle(node, styleName, toReadableStore(value)));
			}
		}

		for (const [className, value] of Object.entries(classNames ?? {})) {
			unsubscribers.push(bindClassName(node, className, toReadableStore(value)));
		}

		return {
			update: (args: T) => args$.set(args),
			destroy: () => unsubscribers.forEach((fn) => fn()),
		};
	});

export type DirectiveAndParam<T> = [Directive<T>, T];

/**
 * Returns an object with the attributes, style and class keys containing information derived from a list of directives.
 *
 *   - The `attributes` value is a JSON representation of key/value attributes, excepted for the `class` and `style` attributes
 *   - The `classNames` value is an array of string representing the classes to be applied
 *   - The `style` value is a JSON representation of the styles to be applied
 *
 * @param directives - List of directives to generate attributes from. Each parameter can be the directive or an array with the directive and its parameter
 * @returns JSON object with the `attributes`, `class` and `style` keys.
 */
export const attributesData = <T extends any[]>(
	...directives: {[K in keyof T]: DirectiveAndParam<T[K]> | Directive<void>}
): {
	attributes: Record<string, string>;
	classNames: string[];
	style: Partial<Record<StyleKey, StyleValue>>;
} => {
	const instances = [];
	try {
		const element = ssrHTMLElement();
		for (const directive of directives) {
			const [directiveFn, arg] = Array.isArray(directive) ? directive : [directive, undefined];
			if (isSSRExecutableDirective(directiveFn)) {
				instances.push(directiveFn.ssr(element, arg));
			}
		}
		return (element as any)[ssrHTMLElementAttributesAndStyle]();
	} finally {
		instances.forEach((instance) => instance?.destroy?.());
	}
};

/**
 * Creates a directive for adding specified CSS class names to an HTML element.
 *
 * @param className - A CSS class name to be added.
 * @returns A directive object with bound class names.
 */
export function createClassDirective(className: string) {
	return createAttributesDirective(() => ({attributes: {class: className}}));
}

/**
 * Returns JSON representation of the attributes to be applied derived from a list of directives.
 *
 * @param directives - List of directives to generate attributes from. Each parameter can be the directive or an array with the directive and its parameter
 * @returns JSON object with name/value for the attributes
 */
export function directiveAttributes<T extends any[]>(...directives: {[K in keyof T]: DirectiveAndParam<T[K]> | Directive<void>}) {
	const {attributes, classNames, style} = attributesData(...directives);
	if (classNames.length) {
		attributes['class'] = classNames.join(' ');
	}
	const stringStyle = Object.entries(style)
		.filter(([, value]) => !!value)
		.map(([name, value]) => `${name}: ${value};`)
		.join('');
	if (stringStyle.length) {
		attributes['style'] = stringStyle;
	}
	return attributes;
}

/**
 * Same as {@link directiveAttributes}, but returns an empty object when run in a browser environement.
 *
 * @returns JSON object with name/value for the attributes
 */
export const ssrAttributes: typeof directiveAttributes = BROWSER ? () => ({}) : directiveAttributes;
