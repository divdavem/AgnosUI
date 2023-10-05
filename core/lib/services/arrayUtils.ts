export const insertElementInSortedArray = <T>(array: T[], element: T, compare?: null | ((a: T, b: T) => number)): T[] => {
	if (!compare || array.length < 1 || compare(array[array.length - 1], element) <= 0) {
		return [...array, element];
	}
	array = [...array];
	let i1 = 0,
		i2 = array.length - 1;
	while (i1 != i2) {
		const midIndex = Math.floor((i1 + i2) / 2);
		const comparisonResult = compare(array[midIndex], element);
		if (comparisonResult > 0) {
			i2 = midIndex;
		} else if (comparisonResult < 0) {
			i1 = midIndex + 1;
		} else {
			i1 = i2 = midIndex;
			break;
		}
	}
	array.splice(i1, 0, element);
	return array;
};

export const removeElementFromArray = <T>(array: T[], element: T): T[] => {
	const index = array.indexOf(element);
	if (index > -1) {
		const copy = [...array];
		copy.splice(index, 1);
		return copy;
	}
	return array; // no change
};

export const compareDefault = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);

export const compareDomOrder = (element1: Node, element2: Node) => {
	if (element1 === element2) {
		return 0;
	}
	const result = element1.compareDocumentPosition(element2);
	if (result & Node.DOCUMENT_POSITION_FOLLOWING) {
		return -1;
	} else if (result & Node.DOCUMENT_POSITION_PRECEDING) {
		return 1;
	}
	throw new Error('failed to compare elements');
};

export const sortInDomOrder = (array: Node[]) => array.sort(compareDomOrder);
