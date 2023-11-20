import type {ReadableSignal} from '@amadeus-it-group/tansu';
import {derived} from '@amadeus-it-group/tansu';
import {noop} from '../utils';

export interface PromisePendingResult {
	/** Pending status */
	status: 'pending';
}
export const promisePending: PromisePendingResult = {status: 'pending'};

export type PromiseState<T> = PromiseFulfilledResult<T> | PromiseRejectedResult | PromisePendingResult;

export const promiseStateStore = <T>(store$: ReadableSignal<T | Promise<T>>): ReadableSignal<PromiseState<T>> =>
	derived(
		store$,
		{
			derive: (promise, set: (value: PromiseState<T>) => void) => {
				set(promisePending);
				Promise.resolve(promise)
					.then((value) => set({status: 'fulfilled', value}))
					.catch((reason) => set({status: 'rejected', reason}));
				return () => {
					set = noop;
				};
			},
			equal: Object.is,
		},
		promisePending,
	);

export const promiseFulfilledResultStore = <T>(
	store$: ReadableSignal<T | Promise<T>>,
	initialValue: T,
	equal?: (a: T, b: T) => boolean,
): ReadableSignal<T> =>
	derived(
		promiseStateStore(store$),
		{
			derive: (state, set) => {
				if (state.status === 'fulfilled') {
					set(state.value);
				}
			},
			equal,
		},
		initialValue,
	);
