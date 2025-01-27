/**
 * This file is a helper to run any combination of framework / browser for e2e (only a single framework or a single browser can be selected)
 *
 * For example:
 *
 * - `npm run e2e` : run the whole test suite
 * - `npm run e2e angular` : run the tests for angular
 * - `npm run e2e angular firefox` : run the tests for angular, on firefox
 * - `npm run e2e angular firefox select` : run the tests for angular, on firefox, filtered on spec files containing `select`
 */

const exec = require('child_process').execSync;
const path = require('path');

const [, , ...args] = process.argv;

const frameworks = ['angular', 'react', 'svelte', 'demo'];
const browsers = ['chromium', 'firefox', 'webkit'];
let framework = '';
let browser = '';

const restArgs = [];
for (let i = 0; i < args.length; i++) {
	const arg = args[i];
	if (frameworks.indexOf(arg) > -1) {
		framework = arg;
	} else if (browsers.indexOf(arg) > -1) {
		browser = arg;
	} else {
		restArgs.push(arg);
	}
}

const cmd = [];
if (framework) {
	console.log(`${framework} framework selected`);
	process.env.FRAMEWORK = framework;
}
if (browser) {
	console.log(`${browser} selected`);
	process.env.BROWSER = browser;
}

cmd.push(`npx playwright test ${restArgs.join(' ')}`);

const strCommand = cmd.join(' ');
console.log(strCommand);
try {
	exec(strCommand, {
		cwd: path.join(__dirname, '..'),
		stdio: [0, 1, 2],
	});
} catch (e) {
	// Hide node internal error
	process.exit(-1);
}
