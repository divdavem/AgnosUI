import type {ReadableSignal, StoreOptions, SubscribableStore, WritableSignal} from '@amadeus-it-group/tansu';

export type WithDollars<P extends object> = {
	[K in keyof P as `${K & string}$`]: P[K];
};

export type ReadableSignals<P extends object> = {
	[K in keyof P]: ReadableSignal<P[K]>;
};

export interface PropsConfig<U extends object> {
	/**
	 * Object containing, for each property, either its initial value, or a store that will contain the value at any time.
	 * The store can be either readable or writable. If the store is only readable (with no set method), the property
	 * cannot change (patching the property will do nothing).
	 * When the value of a property is undefined or invalid, the value from the config is used.
	 */
	props?: {
		[K in keyof U]?: U[K] | ReadableSignal<U[K] | undefined> | WritableSignal<U[K] | undefined>;
	};

	/**
	 * Either a store of objects containing, for each property, the default value,
	 * or an object containing, for each property, either a store containing the default value or the default value itself.
	 */
	config?:
		| ReadableSignal<Partial<U>>
		| {
				[K in keyof U]?: U[K] | ReadableSignal<U[K] | undefined>;
		  };
}

export interface Widget<
	Props extends object = object,
	State extends object = object,
	Api extends object = object,
	Actions extends object = object,
	Directives extends object = object,
> {
	/**
	 * the reactive state of the widget, combining all the values served by the stores
	 */
	state$: ReadableSignal<State>;
	/**
	 * the different stores of the widget, all reactive
	 */
	stores: WithDollars<ReadableSignals<State>>;

	/**
	 * Modify the parameter values, and recalculate the stores accordingly
	 */
	patch(parameters: Partial<Props>): void;
	/**
	 * directives to be used on html elements in the template of the widget or in the slots
	 */
	directives: Directives;
	/**
	 * all the handlers that should be connected to user interactions i.e. click, keyboard and touch interactions.
	 * typically, the handlers are event listeners that call api functions to affect the widget state
	 */
	actions: Actions;
	/**
	 * all the api functions to interact with the widget
	 */
	api: Api;
}

export type ContextWidget<W extends Widget> = Pick<W, 'actions' | 'api' | 'directives' | 'state$' | 'stores'>;

export interface WidgetSlotContext<W extends Widget> {
	/**
	 * the state of the widget
	 */
	state: WidgetState<W>;
	/**
	 * the widget
	 */
	widget: ContextWidget<W>;
}

export const toSlotContextWidget = <W extends Widget>(w: W): ContextWidget<W> => ({
	actions: w.actions,
	api: w.api,
	directives: w.directives,
	state$: w.state$,
	stores: w.stores,
});

export type WidgetState<T extends {state$: SubscribableStore<any>}> = T extends {state$: SubscribableStore<infer U extends object>} ? U : never;
export type WidgetProps<T extends {patch: (arg: any) => void}> = T extends {patch: (arg: Partial<infer U extends object>) => void} ? U : never;
export type WidgetFactory<W extends Widget> = (props?: PropsConfig<WidgetProps<W>>) => W;

export type Directive<T = void> = (node: HTMLElement, args: T) => void | {update?: (args: T) => void; destroy?: () => void};

export type SlotContent<Props extends object = object> = undefined | null | string | ((props: Props) => string);
export type BindableProps<Props extends object> = {
	[P in string & keyof Props as `on${Capitalize<P>}Change` extends keyof Props ? P : never]: Props[P];
};

export const INVALID_VALUE = Symbol();
export type NormalizeValue<T> = (value: T) => T | typeof INVALID_VALUE;
export type AdjustValue<T> = (value: T) => T;

export interface WritableWithDefaultOptions<T> {
	/**
	 * the normalize value function. should return the invalidValue symbol when the provided value is invalid
	 */
	normalizeValue?: NormalizeValue<T>;
	/**
	 * the equal function, allowing to compare two values. used to check if a previous and current values are equals.
	 */
	equal?: StoreOptions<T>['equal'];
}

export type ConfigValidator<T extends object> = {[K in keyof T]?: WritableWithDefaultOptions<T[K]>};
