import type {Partial2Levels} from '@agnos-ui/core';
import {createWidgetsConfig} from '@agnos-ui/core';
import type {PropsWithChildren} from 'react';
import {useContext, useEffect, useMemo} from 'react';
import type {WidgetsConfig} from './Slot';
import {widgetsConfigContext} from './utils';

/**
 * React component that provides in the React context (for all AgnosUI descendant widgets) a new widgets default configuration
 * store that inherits from any widgets default configuration store already defined at an upper level in the React context hierarchy.
 * It contains its own set of widgets configuration properties that override the same properties form the parent configuration.
 *
 * @remarks
 * The configuration is computed from the parent configuration in two steps:
 * - first step: the parent configuration is transformed by the adaptParentConfig function (if specified).
 * If adaptParentConfig is not specified, this step is skipped.
 * - second step: the configuration from step 1 is merged (2-levels deep) with the properties of the component.
 *
 * @param adaptParentConfig - optional function that receives a 2-levels copy of the widgets default configuration
 * defined at an upper level in the Svelte context hierarchy (or an empty object if there is none) and returns the widgets
 * default configuration to be used.
 * It is called only if the configuration is needed, and was not yet computed for the current value of the parent configuration.
 * It is called in a tansu reactive context, so it can use any tansu store and will be called again if those stores change.
 *
 * @returns the resulting widgets default configuration store, which contains 3 additional properties that are stores:
 * parent$, adaptedParent$ (containing the value computed after the first step), and own$ (that contains only overridding properties).
 * The resulting store is writable, its set function is actually the set function of the own$ store.
 *
 * @example
 * ```tsx
 * <WidgetsDefaultConfig
 *   adaptParentConfig={(parentConfig) => {
 *     parentConfig.rating = parentConfig.rating ?? {};
 *     parentConfig.rating.className = `${parentConfig.rating.className ?? ''} my-rating-extra-class`
 *     return parentConfig;
 *   }}
 *   rating={{slotStar: MyCustomSlotStar}}
 * />
 * ```
 */
export const WidgetsDefaultConfig = ({
	children,
	adaptParentConfig,
	...props
}: PropsWithChildren<Partial2Levels<WidgetsConfig>> & {
	adaptParentConfig?: (config: Partial2Levels<WidgetsConfig>) => Partial2Levels<WidgetsConfig>;
}) => {
	const config$ = useContext(widgetsConfigContext);
	const store$ = useMemo(() => createWidgetsConfig(config$, adaptParentConfig), [config$, adaptParentConfig]);
	useEffect(() => {
		store$.set(props);
	}, [props]);
	return <widgetsConfigContext.Provider value={store$}>{children}</widgetsConfigContext.Provider>;
};
