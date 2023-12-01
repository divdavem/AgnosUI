import type {Widget, WidgetFactory, WidgetProps} from '@agnos-ui/core';
import {findChangedProperties, toReadableStore} from '@agnos-ui/core';
import type {ReadableSignal, WritableSignal} from '@amadeus-it-group/tansu';
import {asReadable, computed, writable} from '@amadeus-it-group/tansu';
import {untrack} from 'svelte';
import type {ComponentType, Snippet, SvelteComponent} from 'svelte';
import type {SlotContent} from './slotTypes';

export function createPatchChangedProps<T extends object>(patchFn: (arg: Partial<T>) => void) {
	let previousProps: Partial<T> = {};
	return (props: Partial<T>) => {
		const changedProps = findChangedProperties(previousProps, props);
		previousProps = props;
		if (changedProps) {
			patchFn(changedProps);
		}
	};
}

const toStore = <T>(expression: () => T) => {
	const store = writable(undefined as any as T);
	$effect.pre(() => {
		const value = expression();
		untrack(() => store.set(value));
	});
	return asReadable(store);
};

export const callWidgetFactoryWithConfig = <W extends Widget>({
	factory,
	defaultConfig,
	widgetConfig,
	props: svelteProps,
	bindableProps,
}: {
	factory: WidgetFactory<W>;
	defaultConfig?: Partial<WidgetProps<W>> | ReadableSignal<Partial<WidgetProps<W>> | undefined>;
	widgetConfig?: null | undefined | ReadableSignal<Partial<WidgetProps<W>> | undefined>;
	props: () => Partial<WidgetProps<W>>;
	bindableProps: any;
}): W => {
	const defaultConfig$ = toReadableStore(defaultConfig);
	const target = {};
	for (const prop of Object.keys(bindableProps)) {
		target[prop] = asReadable(
			toStore(() => bindableProps[prop]),
			{
				set(value: any) {
					bindableProps[prop] = value;
				},
			},
		);
	}
	let sync = true;
	const props = new Proxy(target, {
		get(target, p) {
			let res = (target as any)[p];
			if (!res && sync) {
				res = toStore(() => (svelteProps() as any)[p]);
			}
			return res;
		},
	});
	const widget = factory({
		config: computed(() => ({...defaultConfig$(), ...widgetConfig?.()})),
		props,
	});
	sync = false;
	return widget; // {...widget, patchChangedProps: createPatchChangedProps(widget.patch)};
};

export const isSvelteComponent = <Props extends object>(content: SlotContent<Props>): content is ComponentType<SvelteComponent<Props>> => {
	// FIXME: update this function for svelte 5
	// in prod mode, a svelte component has $set on its prototype
	// in dev mode with hmr (hot module reload), a svelte component has nothing on its prototype, but its name starts with Proxy<
	return (
		(typeof content === 'function' && !!content.prototype && (content.prototype.$set || /^Proxy</.test(content.name))) ||
		// when using Server Side Rendering, a svelte component is an object with a render function:
		// (cf https://svelte.dev/docs/server-side-component-api)
		typeof (content as any)?.render === 'function'
	);
};

export const isSvelteSnippet = <Props extends object>(content: SlotContent<Props>): content is Snippet<Props> => {
	// FIXME: implement this function for svelte 5
	return false;
};
