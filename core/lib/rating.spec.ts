import type {UnsubscribeFunction, WritableSignal} from '@amadeus-it-group/tansu';
import {computed, writable} from '@amadeus-it-group/tansu';
import type {SpyInstance} from 'vitest';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import type {RatingWidget, RatingProps} from './rating';
import {createRating} from './rating';
import type {WidgetState} from './types';

function keyboardEvent(key: string): KeyboardEvent {
	return {
		key,
		preventDefault() {},
		stopPropagation() {},
	} as KeyboardEvent;
}

describe(`Rating`, () => {
	describe('with subscription on the state', () => {
		let rating: RatingWidget;
		let state: WidgetState<RatingWidget>;
		let unsubscribe: UnsubscribeFunction;
		let stateChangeCount = 0;
		const hovers: number[] = [];
		const leaves: number[] = [];

		const callbacks = {
			onHover: (i: number) => hovers.push(i),
			onLeave: (i: number) => leaves.push(i),
		};

		let defConfig: WritableSignal<Partial<RatingProps>>;
		let consoleErrorSpy: SpyInstance<Parameters<typeof console.error>, ReturnType<typeof console.error>>;

		beforeEach(() => {
			consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			defConfig = writable({});
			rating = createRating(computed(() => ({...callbacks, ...defConfig()})));
			unsubscribe = rating.state$.subscribe((newState) => {
				stateChangeCount++;
				state = newState;
			});
		});

		afterEach(() => {
			stateChangeCount = 0;
			hovers.length = 0;
			leaves.length = 0;
			unsubscribe();
			expect(consoleErrorSpy).not.toHaveBeenCalled();
			consoleErrorSpy.mockRestore();
		});

		const expectLogInvalidValue = () => {
			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy.mock.calls[0][0]).toContain('invalid');
			consoleErrorSpy.mockClear();
		};

		test(`should have sensible state`, () => {
			expect(state).toStrictEqual({
				rating: 0,
				ariaLabel: 'Rating',
				ariaLabelledBy: '',
				ariaValueText: `0 out of 10`,
				maxRating: 10,
				visibleRating: 0,
				disabled: false,
				readonly: false,
				resettable: true,
				tabindex: 0,
				isInteractive: true,
				stars: Array.from({length: 10}, (_, i) => ({fill: 0, index: i})),
				className: '',
				slotStar: expect.any(Function),
			});
		});

		test(`should ignore invalid 'rating' values`, () => {
			expect(state).toContain({rating: 0, maxRating: 10});
			expect(stateChangeCount).toBe(1);

			// note that this is not invalid, it only goes back to the default value
			rating.patch({rating: undefined as any});
			expect(state).toContain({rating: 0});
			expect(stateChangeCount).toBe(1);

			expect(consoleErrorSpy).not.toHaveBeenCalled();

			rating.patch({rating: 'blah' as any});
			expect(state).toContain({rating: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({rating: Infinity as any});
			expect(state).toContain({rating: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({rating: NaN as any});
			expect(state).toContain({rating: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({rating: {} as any});
			expect(state).toContain({rating: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();
		});

		test(`should ignore invalid 'maxRating' values`, () => {
			expect(state).toContain({rating: 0, maxRating: 10});
			expect(stateChangeCount).toBe(1);

			expect(consoleErrorSpy).not.toHaveBeenCalled();
			rating.patch({maxRating: null as any});
			expect(state).toContain({maxRating: 10});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			// note that this is not invalid, it only goes back to the default value
			rating.patch({maxRating: undefined as any});
			expect(state).toContain({maxRating: 10});
			expect(stateChangeCount).toBe(1);
			expect(consoleErrorSpy).not.toHaveBeenCalled();

			rating.patch({maxRating: 'blah' as any});
			expect(state).toContain({maxRating: 10});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({maxRating: Infinity as any});
			expect(state).toContain({maxRating: 10});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({maxRating: NaN as any});
			expect(state).toContain({maxRating: 10});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({maxRating: {} as any});
			expect(state).toContain({maxRating: 10});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();
		});

		test(`should ignore invalid 'disabled' values`, () => {
			expect(state).toContain({disabled: false});
			expect(stateChangeCount).toBe(1);

			expect(consoleErrorSpy).not.toHaveBeenCalled();
			rating.patch({disabled: null as any});
			expect(state).toContain({disabled: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			// note that this is not invalid, it only goes back to the default value
			rating.patch({disabled: undefined as any});
			expect(state).toContain({disabled: false});
			expect(stateChangeCount).toBe(1);
			expect(consoleErrorSpy).not.toHaveBeenCalled();

			rating.patch({disabled: 'blah' as any});
			expect(state).toContain({disabled: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({disabled: Infinity as any});
			expect(state).toContain({disabled: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({disabled: NaN as any});
			expect(state).toContain({disabled: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({disabled: {} as any});
			expect(state).toContain({disabled: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();
		});

		test(`should ignore invalid 'readonly' values`, () => {
			expect(state).toContain({readonly: false});
			expect(stateChangeCount).toBe(1);

			expect(consoleErrorSpy).not.toHaveBeenCalled();
			rating.patch({readonly: null as any});
			expect(state).toContain({readonly: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			// note that this is not invalid, it only goes back to the default value
			rating.patch({readonly: undefined as any});
			expect(state).toContain({readonly: false});
			expect(stateChangeCount).toBe(1);
			expect(consoleErrorSpy).not.toHaveBeenCalled();

			rating.patch({readonly: 'blah' as any});
			expect(state).toContain({readonly: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({readonly: Infinity as any});
			expect(state).toContain({readonly: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({readonly: NaN as any});
			expect(state).toContain({readonly: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({readonly: {} as any});
			expect(state).toContain({readonly: false});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();
		});

		test(`should ignore invalid 'tabindex' values`, () => {
			expect(state).toContain({tabindex: 0});
			expect(stateChangeCount).toBe(1);

			expect(consoleErrorSpy).not.toHaveBeenCalled();
			rating.patch({tabindex: null as any});
			expect(state).toContain({tabindex: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			// note that this is not invalid, it only goes back to the default value
			rating.patch({tabindex: undefined as any});
			expect(state).toContain({tabindex: 0});
			expect(stateChangeCount).toBe(1);
			expect(consoleErrorSpy).not.toHaveBeenCalled();

			rating.patch({tabindex: 'blah' as any});
			expect(state).toContain({tabindex: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({tabindex: Infinity as any});
			expect(state).toContain({tabindex: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({tabindex: NaN as any});
			expect(state).toContain({tabindex: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();

			rating.patch({tabindex: {} as any});
			expect(state).toContain({tabindex: 0});
			expect(stateChangeCount).toBe(1);
			expectLogInvalidValue();
		});

		test(`should allow setting 'tabindex'`, () => {
			expect(state).toContain({disabled: false, tabindex: 0});

			rating.patch({tabindex: 1});
			expect(state).toContain({tabindex: 1});

			rating.patch({disabled: true});
			expect(state).toContain({tabindex: -1});

			rating.patch({disabled: false});
			expect(state).toContain({tabindex: 1});
		});

		test(`should set rating/visibleRating within [0, maxRating]`, () => {
			expect(state).toContain({rating: 0, maxRating: 10});

			rating.patch({rating: 5});
			expect(state).toContain({rating: 5, visibleRating: 5, maxRating: 10});

			rating.patch({rating: 100});
			expect(state).toContain({rating: 10, visibleRating: 10, maxRating: 10});

			rating.patch({maxRating: 11});
			expect(state).toContain({rating: 10, visibleRating: 10, maxRating: 11});

			rating.patch({rating: -100});
			expect(state).toContain({rating: 0, visibleRating: 0, maxRating: 11});
		});

		test(`should generate star contexts correctly when 'rating' changes`, () => {
			rating.patch({rating: 1, maxRating: 2});
			expect(state.stars).toEqual([
				{
					fill: 100,
					index: 0,
				},
				{
					fill: 0,
					index: 1,
				},
			]);

			rating.patch({rating: 2, maxRating: 2});
			expect(state.stars).toEqual([
				{
					fill: 100,
					index: 0,
				},
				{
					fill: 100,
					index: 1,
				},
			]);

			rating.patch({rating: 0, maxRating: 0});
			expect(state.stars).toEqual([]);

			rating.patch({rating: 1.75, maxRating: 2});
			expect(state.stars).toEqual([
				{
					fill: 100,
					index: 0,
				},
				{
					fill: 75,
					index: 1,
				},
			]);
		});

		test(`should generate star contexts and visible rating correctly when 'hover()/leave()' changes`, () => {
			const stars = [
				{
					fill: 75,
					index: 0,
				},
				{
					fill: 0,
					index: 1,
				},
			];

			rating.patch({rating: 0.75, maxRating: 2});
			expect(state.visibleRating).toBe(0.75);
			expect(state.stars).toEqual(stars);
			expect(hovers).toEqual([]);
			expect(leaves).toEqual([]);

			// hover 2
			rating.actions.hover(2);
			expect(hovers).toEqual([2]);
			expect(leaves).toEqual([]);
			expect(state.visibleRating).toBe(2);
			expect(state.stars).toEqual([
				{
					fill: 100,
					index: 0,
				},
				{
					fill: 100,
					index: 1,
				},
			]);

			// hover 1
			rating.actions.hover(1);
			expect(hovers).toEqual([2, 1]);
			expect(leaves).toEqual([]);
			expect(state.visibleRating).toBe(1);
			expect(state.stars).toEqual([
				{
					fill: 100,
					index: 0,
				},
				{
					fill: 0,
					index: 1,
				},
			]);

			// leave
			rating.actions.leave();
			expect(hovers).toEqual([2, 1]);
			expect(leaves).toEqual([1]);
			expect(state.visibleRating).toBe(0.75);
			expect(state.stars).toEqual(stars);
			expect(stateChangeCount).toBe(5);

			// hover -1 -> ignored
			rating.actions.hover(-1);
			expect(hovers).toEqual([2, 1]);
			expect(leaves).toEqual([1]);
			expect(state.visibleRating).toBe(0.75);
			expect(state.stars).toEqual(stars);
			expect(stateChangeCount).toBe(5);

			// hover 5 -> ignored
			rating.actions.hover(5);
			expect(hovers).toEqual([2, 1]);
			expect(leaves).toEqual([1]);
			expect(state.visibleRating).toBe(0.75);
			expect(state.stars).toEqual(stars);
			expect(stateChangeCount).toBe(5);
		});

		test(`should use 'ariaValueTextFn' to generate aria value text`, () => {
			expect(state).toContain({rating: 0, maxRating: 10, ariaValueText: '0 out of 10'});

			rating.patch({rating: 5});
			expect(state).toContain({ariaValueText: '5 out of 10'});

			rating.patch({maxRating: 7});
			expect(state).toContain({ariaValueText: '5 out of 7'});

			rating.patch({ariaValueTextFn: (rating: number, maxRating: number) => `${rating}/${maxRating}`});
			expect(state).toContain({ariaValueText: '5/7'});

			expect(consoleErrorSpy).not.toHaveBeenCalled();
			rating.patch({ariaValueTextFn: null as any, rating: 4});
			expect(state).toContain({ariaValueText: '4/7'});
			expectLogInvalidValue();
		});

		test(`should adjust rating within [0, 'maxRating'] when updating 'maxRating'`, () => {
			rating.patch({rating: 5});
			expect(state).toContain({rating: 5, maxRating: 10});

			rating.patch({maxRating: 2});
			expect(state).toContain({rating: 2, maxRating: 2});

			rating.patch({rating: 5, maxRating: 10});
			expect(state).toContain({rating: 5, maxRating: 10});

			rating.patch({maxRating: -100});
			expect(state).toContain({rating: 0, maxRating: 0});
		});

		test(`should update rating when disabled via 'patch()'`, () => {
			rating.patch({disabled: true});
			expect(state).toContain({disabled: true, readonly: false, rating: 0, maxRating: 10});

			// allow values to be set
			rating.patch({rating: 5, maxRating: 7});
			expect(state).toContain({rating: 5, maxRating: 7});
		});

		test(`should update rating when readonly via 'patch()'`, () => {
			rating.patch({readonly: true});
			expect(state).toContain({disabled: false, readonly: true, rating: 0, maxRating: 10});

			// allow values to be set
			rating.patch({rating: 5, maxRating: 7});
			expect(state).toContain({rating: 5, maxRating: 7});
		});

		test(`should handle user 'click()' changes`, () => {
			expect(state).toContain({rating: 0, maxRating: 10, resettable: true});
			expect(stateChangeCount).toBe(1);

			rating.actions.click(3);
			expect(state).toContain({rating: 3});
			expect(stateChangeCount).toBe(2);

			rating.actions.click(0);
			expect(state).toContain({rating: 3});
			expect(stateChangeCount).toBe(2);

			rating.actions.click(-1);
			expect(state).toContain({rating: 3});
			expect(stateChangeCount).toBe(2);

			rating.actions.click(11);
			expect(state).toContain({rating: 3});
			expect(stateChangeCount).toBe(2);
		});

		test(`should be 'resettable' or not`, () => {
			rating.patch({rating: 5});
			expect(state).toContain({rating: 5, maxRating: 10, resettable: true});
			expect(stateChangeCount).toBe(2);

			rating.actions.click(5);
			expect(state).toContain({rating: 0});
			expect(stateChangeCount).toBe(3);

			rating.patch({rating: 5, resettable: false});
			expect(state).toContain({rating: 5, resettable: false});
			expect(stateChangeCount).toBe(4);

			rating.actions.click(5);
			expect(state).toContain({rating: 5});
			expect(stateChangeCount).toBe(4);
		});

		test(`should generate correct 'isInteractive' values`, () => {
			expect(state).toContain({disabled: false, readonly: false, isInteractive: true});

			rating.patch({disabled: true, readonly: false});
			expect(state).toContain({isInteractive: false});

			rating.patch({disabled: false, readonly: true});
			expect(state).toContain({isInteractive: false});

			rating.patch({disabled: true, readonly: true});
			expect(state).toContain({isInteractive: false});

			rating.patch({disabled: false, readonly: false});
			expect(state).toContain({isInteractive: true});
		});

		test(`should ignore user rating changes when disabled`, () => {
			rating.patch({disabled: true, rating: 5});
			expect(state).toContain({disabled: true, readonly: false, rating: 5});
			expect(stateChangeCount).toBe(2);

			// user interactions should be ignored
			rating.actions.click(3);
			expect(state).toContain({rating: 5});
			expect(stateChangeCount).toBe(2);
		});

		test(`should ignore user rating changes when readonly`, () => {
			rating.patch({readonly: true, rating: 5});
			expect(state).toContain({disabled: false, readonly: true, rating: 5});
			expect(stateChangeCount).toBe(2);

			// user interactions should be ignored
			rating.actions.click(3);
			expect(state).toContain({rating: 5});
			expect(stateChangeCount).toBe(2);
		});

		test(`should handle known keyboard events`, () => {
			rating.patch({rating: 5});
			expect(state).toContain({disabled: false, readonly: false, rating: 5, maxRating: 10});

			const evt = keyboardEvent('');
			const preventDefault = vi.spyOn(evt, 'preventDefault');
			const stopPropagation = vi.spyOn(evt, 'stopPropagation');

			// Known keys
			rating.actions.handleKey({...evt, key: 'ArrowLeft'});
			expect(state).toContain({rating: 4});
			expect(preventDefault).toHaveBeenCalledTimes(1);
			expect(stopPropagation).toHaveBeenCalledTimes(1);

			rating.actions.handleKey({...evt, key: 'ArrowDown'});
			expect(state).toContain({rating: 3});
			expect(preventDefault).toHaveBeenCalledTimes(2);
			expect(stopPropagation).toHaveBeenCalledTimes(2);

			rating.actions.handleKey({...evt, key: 'ArrowUp'});
			expect(state).toContain({rating: 4});
			expect(preventDefault).toHaveBeenCalledTimes(3);
			expect(stopPropagation).toHaveBeenCalledTimes(3);

			rating.actions.handleKey({...evt, key: 'ArrowRight'});
			expect(state).toContain({rating: 5});
			expect(preventDefault).toHaveBeenCalledTimes(4);
			expect(stopPropagation).toHaveBeenCalledTimes(4);

			rating.actions.handleKey({...evt, key: 'Home'});
			expect(state).toContain({rating: 0});
			expect(preventDefault).toHaveBeenCalledTimes(5);
			expect(stopPropagation).toHaveBeenCalledTimes(5);

			rating.actions.handleKey({...evt, key: 'End'});
			expect(state).toContain({rating: 10});
			expect(preventDefault).toHaveBeenCalledTimes(6);
			expect(stopPropagation).toHaveBeenCalledTimes(6);
		});

		test(`should ignore unknown keyboard events`, () => {
			rating.patch({rating: 5});
			expect(state).toContain({disabled: false, readonly: false, rating: 5, maxRating: 10});

			const evt = keyboardEvent('Enter');
			const preventDefault = vi.spyOn(evt, 'preventDefault');
			const stopPropagation = vi.spyOn(evt, 'stopPropagation');

			// Unknown keys
			rating.actions.handleKey(evt);
			expect(state).toContain({rating: 5});
			expect(preventDefault).not.toHaveBeenCalled();
			expect(stopPropagation).not.toHaveBeenCalled();
		});

		test(`should ignore known keyboard events when disabled or readonly`, () => {
			rating.patch({rating: 5});
			expect(state).toContain({disabled: false, readonly: false, rating: 5, maxRating: 10});

			const evt = keyboardEvent('');
			const preventDefault = vi.spyOn(evt, 'preventDefault');
			const stopPropagation = vi.spyOn(evt, 'stopPropagation');

			// Disabled
			rating.patch({readonly: false, disabled: true});
			rating.actions.handleKey({...evt, key: 'ArrowLeft'});
			expect(state).toContain({rating: 5});
			expect(preventDefault).toHaveBeenCalledTimes(0);
			expect(stopPropagation).toHaveBeenCalledTimes(0);

			// Readonly
			rating.patch({readonly: true, disabled: false});
			rating.actions.handleKey({...evt, key: 'ArrowLeft'});
			expect(state).toContain({rating: 5});
			expect(preventDefault).toHaveBeenCalledTimes(0);
			expect(stopPropagation).toHaveBeenCalledTimes(0);
		});

		test(`should follow updated default config as long as it is not overridden`, () => {
			defConfig.set({rating: 2});
			expect(state).toContain({rating: 2});
			defConfig.set({});
			expect(state).toContain({rating: 0});
			defConfig.set({rating: 5});
			expect(state).toContain({rating: 5});

			rating.patch({maxRating: 4}); // this sets the rating to 4
			expect(state).toContain({rating: 4});
			defConfig.set({rating: 2}); // now this has no effect anymore
			expect(state).toContain({rating: 4});

			rating.patch({rating: undefined}); // resetting the own value to undefined allows to follow again the defaults
			expect(state).toContain({rating: 2});
		});
	});

	describe('without subscription on the state', () => {
		test('should work when subscribing on visibleRating$ only', () => {
			const values: number[] = [];
			const visibleRatingValues: number[] = [];
			const ratingWidget = createRating({
				maxRating: 10,
				rating: 2,
				onRatingChange(value) {
					values.push(value);
				},
			});
			const unsubscribe = ratingWidget.stores.visibleRating$.subscribe((value) => visibleRatingValues.push(value));
			expect(visibleRatingValues).toEqual([2]);
			ratingWidget.actions.hover(8);
			expect(visibleRatingValues).toEqual([2, 8]);
			ratingWidget.actions.click(8);
			expect(values).toEqual([8]);
			unsubscribe();
		});
	});
});
