import svelteParser from 'svelte-eslint-parser';
import toBabel from 'estree-to-babel';
import printer from '@babel/generator/lib/printer.js';
import {dirname} from 'path';
import {transformFromAstSync} from '@babel/core';

const printerPrototype: Record<string, (this: {print(arg: any): void}, node: any, parent: any) => void> = (printer.default ?? printer).prototype;

// Babel does not support Svelte nodes
// Add corresponding printer functions:

printerPrototype.SvelteScriptElement = function () {};
printerPrototype.SvelteStyleElement = function () {};
printerPrototype.SvelteElement = function () {};
printerPrototype.SvelteStartTag = function () {};
printerPrototype.SvelteEndTag = function () {};
printerPrototype.SvelteName = function () {};
printerPrototype.SvelteMemberExpressionName = function () {};
printerPrototype.SvelteLiteral = function () {};
printerPrototype.SvelteMustacheTag = function () {};
printerPrototype.SvelteDebugTag = function () {};
printerPrototype.SvelteConstTag = function () {};
printerPrototype.SvelteIfBlock = function () {};
printerPrototype.SvelteElseBlock = function () {};
printerPrototype.SvelteEachBlock = function () {};
printerPrototype.SvelteAwaitBlock = function () {};
printerPrototype.SvelteAwaitPendingBlock = function () {};
printerPrototype.SvelteAwaitThenBlock = function () {};
printerPrototype.SvelteAwaitCatchBlock = function () {};
printerPrototype.SvelteKeyBlock = function () {};
printerPrototype.SvelteAttribute = function () {};
printerPrototype.SvelteShorthandAttribute = function () {};
printerPrototype.SvelteSpreadAttribute = function () {};
printerPrototype.SvelteDirective = function () {};
printerPrototype.SvelteStyleDirective = function () {};
printerPrototype.SvelteSpecialDirective = function () {};
printerPrototype.SvelteDirectiveKey = function () {};
printerPrototype.SvelteSpecialDirectiveKey = function () {};
printerPrototype.SvelteText = function () {};
printerPrototype.SvelteHTMLComment = function () {};
printerPrototype.SvelteReactiveStatement = function () {};

export const instrumentSvelteFile = (code: string, filename: string) => {
	const output = svelteParser.parseForESLint(code, {
		parser: '@typescript-eslint/parser',
	});
	const babelAst = toBabel(output.ast);
	const result = transformFromAstSync(babelAst, code, {
		filename,
		plugins: [
			[
				'babel-plugin-istanbul',
				{
					cwd: dirname(filename),
					exclude: [],
				},
			],
		],
	});
	if (result?.code) {
		return result.code;
	}
	return code;
};
