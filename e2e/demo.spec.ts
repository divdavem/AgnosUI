import type {Page} from '@playwright/test';
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {AxeResults} from 'axe-core';
import {globSync} from 'glob';
import path from 'path';

const pathRegExp = /\\/g;

function normalizePath(str: string) {
	return str.replace(pathRegExp, '/');
}

const pathToFrameworkDir = normalizePath(path.join(__dirname, '../demo/src/routes'));
const allRoutes = globSync(`${pathToFrameworkDir}/**/+page.svelte`).map((route) =>
	normalizePath(route).replace(pathToFrameworkDir, '').replace('/+page.svelte', '')
);

async function analyze(page: Page): Promise<AxeResults> {
	return (
		new AxeBuilder({page})
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			// TODO remove the color-contrast exclusion once we have decided on the theming of the demos
			.disableRules(['color-contrast'])
			.analyze()
	);
}

test.describe.parallel('Demo Website', () => {
	for (const route of allRoutes) {
		const svelteRoute = route.replace('[framework]', 'svelte');
		test(`Route ${svelteRoute || '/'} should be accessible`, async ({page}) => {
			await page.goto(svelteRoute);
			const frames = page.frames();
			if (frames.length > 1) {
				const iframes = frames.slice(1);
				await Promise.all(iframes.map((frame) => expect.poll(() => frame.url()).not.toBe('about:blank')));
				await Promise.all(iframes.map((frame) => frame.waitForURL(frame.url())));
			}
			expect((await analyze(page)).violations).toEqual([]);
		});
	}
});
