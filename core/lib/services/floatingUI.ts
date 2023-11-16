import {computed, derived} from '@amadeus-it-group/tansu';
import type {ArrowOptions, AutoUpdateOptions, ComputePositionConfig, ComputePositionReturn, Derivable} from '@floating-ui/dom';
import {arrow, autoUpdate, computePosition} from '@floating-ui/dom';
import {noop} from '../utils';
import {createStoreDirective} from './directiveUtils';
import {stateStores, writablesForProps, type PropsConfig} from './stores';

export * as floatingUI from '@floating-ui/dom';

export interface FloatingUIProps {
	/**
	 * Options to use when calling computePosition from Floating UI
	 */
	computePositionOptions: ComputePositionConfig;

	/**
	 * Options to use when calling autoUpdate from Floating UI
	 */
	autoUpdateOptions: AutoUpdateOptions;

	/**
	 * Options to use when calling the arrow middleware from Floating UI
	 */
	arrowOptions: Omit<ArrowOptions, 'element'> | Derivable<Omit<ArrowOptions, 'element'>>;
}

const defaultConfig: FloatingUIProps = {
	computePositionOptions: {},
	autoUpdateOptions: {},
	arrowOptions: {},
};

export const createFloatingUI = (propsConfig?: PropsConfig<FloatingUIProps>) => {
	const [{autoUpdateOptions$, computePositionOptions$: computePositionInputOptions$, arrowOptions$: arrowInputOptions$}, patch] = writablesForProps(
		defaultConfig,
		propsConfig,
	);

	const {directive: floatingDirective, element$: floatingElement$} = createStoreDirective();
	const {directive: referenceDirective, element$: referenceElement$} = createStoreDirective();
	const {directive: arrowDirective, element$: arrowElement$} = createStoreDirective();

	const arrowOptions$ = computed((): null | ArrowOptions | Derivable<ArrowOptions> => {
		const arrowElement = arrowElement$();
		if (!arrowElement) {
			return null;
		}
		const arrowInputOptions = arrowInputOptions$();
		return typeof arrowInputOptions === 'function'
			? (state) => ({...arrowInputOptions(state), element: arrowElement})
			: {...arrowInputOptions, element: arrowElement};
	});

	const computePositionOptions$ = computed(() => {
		let options = computePositionInputOptions$();
		const arrowOptions = arrowOptions$();
		if (arrowOptions) {
			options = {
				...options,
				middleware: [...(options.middleware ?? []), arrow(arrowOptions)],
			};
		}
		return options;
	});

	const position$ = derived(
		[floatingElement$, referenceElement$, computePositionOptions$, autoUpdateOptions$],
		{
			derive: (
				[floatingElement, referenceElement, computePositionOptions, autoUpdateOptions],
				set: (value: null | ComputePositionReturn) => void,
			) => {
				if (floatingElement && referenceElement) {
					const update = async () => {
						set(await computePosition(referenceElement, floatingElement, computePositionOptions));
					};
					const clean = autoUpdate(referenceElement, floatingElement, update, autoUpdateOptions);
					return () => {
						set(null);
						set = noop;
						clean();
					};
				}
				return undefined;
			},
		},
		null,
	);

	const placement$ = computed(() => position$()?.placement);
	const middlewareData$ = computed(() => position$()?.middlewareData);
	const x$ = computed(() => position$()?.x);
	const y$ = computed(() => position$()?.y);
	const strategy$ = computed(() => position$()?.strategy);

	const floatingStyle$ = computed(() => `left:${x$() ?? 0}px;top:${y$() ?? 0}px;`);

	const arrowStyle$ = computed(() => {
		const arrow = middlewareData$()?.arrow;
		let answer = '';
		if (arrow?.x != null) {
			answer += `left:${arrow.x}px;`;
		}
		if (arrow?.y != null) {
			answer += `top:${arrow.y}px;`;
		}
		return answer;
	});

	return {
		patch,
		...stateStores({
			x$,
			y$,
			strategy$,
			placement$,
			middlewareData$,
			floatingStyle$,
			arrowStyle$,
		}),
		directives: {
			referenceDirective,
			floatingDirective,
			arrowDirective,
		},
	};
};
