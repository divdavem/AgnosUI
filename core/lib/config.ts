import type {ReadableSignal, WritableSignal} from '@amadeus-it-group/tansu';
import {asReadable, computed, writable} from '@amadeus-it-group/tansu';
import type {ModalProps} from './modal/modal';
import type {AlertProps} from './alert';
import type {PaginationProps} from './pagination';
import type {RatingProps} from './rating';
import type {SelectProps} from './select';
import {identity} from './utils';

export type Partial2Levels<T> = Partial<{
	[Level1 in keyof T]: Partial<T[Level1]>;
}>;

export type WidgetsConfigStore<T> = WritableSignal<Partial2Levels<T>> & {
	own$: WritableSignal<Partial2Levels<T>>;
	parent$: undefined | WritableSignal<Partial2Levels<T>>;
	adaptedParent$: undefined | ReadableSignal<Partial2Levels<T>>;
};

/**
 * Merges source object into destination object, up to the provided number of levels.
 * @param destination - destination object
 * @param source - source object
 * @param levels - number of levels to merge
 * @returns the destination object in most cases, or the source in some cases (if the source is not undefined and either levels is smaller than 1
 * or the source is not an object)
 */
export const mergeInto = <T>(destination: T, source: T | undefined, levels = Infinity): T => {
	if (source !== undefined) {
		if (typeof source === 'object' && source && levels >= 1) {
			for (const key of Object.keys(source) as (keyof T)[]) {
				destination[key] = mergeInto(destination[key] ?? {}, source[key] as any, levels - 1);
			}
		} else {
			return source;
		}
	}
	return destination;
};

/**
 * Creates a new widgets default configuration store, optionally inheriting from a parent store, and containing
 * its own set of widgets configuration properties that override the same properties form the parent configuration.
 *
 * @remarks
 * The resulting store has a value computed from the parent store in two steps:
 * - first step: the parent configuration is transformed by the adaptParentConfig function (if specified).
 * If adaptParentConfig is not specified, this step is skipped.
 * - second step: the configuration from step 1 is merged (2-levels deep) with the own$ store. The own$ store initially contains
 * an empty object (i.e. no property from the parent is overridden). It can be changed by calling set on the store returned by this function.
 *
 * @param parent$ - optional parent widgets default configuration store.
 * @param adaptParentConfig - optional function that receives a 2-levels copy of the widgets default configuration
 * from parent$ (or an empty object if parent$ is not specified) and returns the widgets default configuration to be used.
 * It is called only if the configuration is needed, and was not yet computed for the current value of the parent configuration.
 * It is called in a tansu reactive context, so it can use any tansu store and will be called again if those stores change.
 * @returns the resulting widgets default configuration store, which contains 3 additional properties that are stores:
 * parent$, adaptedParent$ (containing the value computed after the first step), and own$ (that contains only overridding properties).
 * The resulting store is writable, its set function is actually the set function of the own$ store.
 */
export const createWidgetsConfig = <T>(
	parent$?: WidgetsConfigStore<T> | undefined,
	adaptParentConfig: (config: Partial2Levels<T>) => Partial2Levels<T> = identity
): WidgetsConfigStore<T> => {
	const own$ = writable({} as Partial2Levels<T>);
	const adaptedParent$ = adaptParentConfig === identity ? parent$ : computed(() => adaptParentConfig(mergeInto({}, parent$?.(), 2)));
	return asReadable(
		computed(() => mergeInto(mergeInto({}, adaptedParent$?.(), 2), own$(), 2)),
		{
			...own$,
			own$,
			adaptedParent$,
			parent$,
		}
	);
};

export interface WidgetsConfig {
	pagination: PaginationProps;
	rating: RatingProps;
	select: SelectProps<any>;
	modal: ModalProps;
	alert: AlertProps;
}
