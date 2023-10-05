import {describe, expect, it} from 'vitest';
import {insertElementInSortedArray, removeElementFromArray, sortInDomOrder} from './arrayUtils';

describe('arrayUtils', () => {
	describe('insertElementInSortedArray', () => {
		it('Basic functionalities', () => {
			const numberCompare = (a: number, b: number) => a - b;
			const check = (array: number[], element: number, expectedResult: number[]) => {
				const originalArrayCopy = [...array];
				const result = insertElementInSortedArray(array, element, numberCompare);
				expect(array).toStrictEqual(originalArrayCopy); // the original array should not be changed
				expect(result).toStrictEqual(expectedResult);
			};
			check([], 5, [5]);
			check([1], 5, [1, 5]);
			check([7], 5, [5, 7]);
			check([5], 5, [5, 5]);
			check([1, 2], 5, [1, 2, 5]);
			check([8, 9], 5, [5, 8, 9]);
			check([4, 6], 5, [4, 5, 6]);
			check([1, 2, 9], 5, [1, 2, 5, 9]);
			check([1, 2, 5, 9], 5, [1, 2, 5, 5, 9]);
		});
	});

	describe('removeElementFromArray', () => {
		it('Basic functionalities', () => {
			const array = [1, 2];
			expect(removeElementFromArray(array, 3)).toBe(array); // no change: return original array
			const removed1 = removeElementFromArray(array, 1);
			expect(removed1).toStrictEqual([2]);
			expect(array).toStrictEqual([1, 2]); // should not change the original array
			expect(removeElementFromArray([3, 2, 3], 3)).toStrictEqual([2, 3]); // removes the first occurrence only
		});
	});

	describe('sortInDomOrder', () => {
		it('should sort in the right order', () => {
			const element = document.createElement('div');
			const element1 = document.createElement('div');
			element1.id = 'id1';
			const element2 = document.createElement('div');
			element2.id = 'id2';
			const element3 = document.createElement('div');
			element3.id = 'id3';
			element.appendChild(element1);
			element.appendChild(element2);
			element.appendChild(element3);
			expect(sortInDomOrder([element1, element2, element3])).toStrictEqual([element1, element2, element3]);
			expect(sortInDomOrder([element1, element3, element2])).toStrictEqual([element1, element2, element3]);
			expect(sortInDomOrder([element2, element1, element3])).toStrictEqual([element1, element2, element3]);
			expect(sortInDomOrder([element2, element3, element1])).toStrictEqual([element1, element2, element3]);
			expect(sortInDomOrder([element3, element1, element2])).toStrictEqual([element1, element2, element3]);
			expect(sortInDomOrder([element3, element2, element1])).toStrictEqual([element1, element2, element3]);
			expect(sortInDomOrder([element1, element3, element1])).toStrictEqual([element1, element1, element3]);
		});
	});
});
