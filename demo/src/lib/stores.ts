import {computed, get} from '@amadeus-it-group/tansu';
import {browser} from '$app/environment';
import {page} from '$app/stores';
import {createIntersection} from '@agnos-ui/core/services/intersection';

// Return how deep the current route is compared to base
export const routeLevel$ = computed(() => {
	const $page = get(page);
	if (!$page.route.id) {
		throw new Error('Page error');
	}
	return $page.route.id.split('/').length - 2;
});

// Return the url relative path to root, ex './', '../' or '../..'
export const relativePathToRoot$ = computed(() => {
	const routeLevel = routeLevel$();
	return routeLevel ? '../'.repeat(routeLevel) : './';
});

export const pathToRoot$ = browser ? computed(() => new URL(relativePathToRoot$(), window.location.href).href) : relativePathToRoot$;

const baseCanonicalURL = 'https://amadeusitgroup.github.io/AgnosUI/latest/';
export const canonicalURL$ = computed(() => {
	const pageURL = get(page).url.href;
	const rootURL = new URL(relativePathToRoot$(), pageURL).href;
	const canonicalURL = pageURL.replace(rootURL, baseCanonicalURL);
	return canonicalURL;
});

export type Frameworks = 'angular' | 'react' | 'svelte';

/**
 * Current selected framework
 */
export const selectedFramework$ = computed(() => {
	return <Frameworks>(get(page).params.framework ?? 'angular');
});

const tabRegExp = /^\/\[framework\]\/components\/[^/]*\/([^/]*)/;
/**
 * Current selected tab
 */
export const selectedTabName$ = computed(() => {
	const match = tabRegExp.exec(get(page).route.id || '');
	return match?.[1] || 'examples';
});

const frameworkKeyRegExp = /^\/\[framework\]\//;
export const frameworkLessUrl$ = computed(() => {
	return (get(page).route.id || '').replace(frameworkKeyRegExp, '');
});

export const intersectionApi = createIntersection();
