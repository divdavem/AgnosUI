import {transform} from '@babel/core';
import {dirname} from 'path';
import {instrumentSvelteFile} from './instrumentSvelteFile';

const supportedExtensionsRegExp = /\.(tsx?|jsx?|svelte)$/;
export const canInstrument = (fileName: string) => !fileName.includes('\x00') && supportedExtensionsRegExp.test(fileName);

export const instrumentFile = (code: string, filename: string) => {
	console.log('Instrumenting for coverage: ', filename);
	if (filename.endsWith('.svelte')) {
		return instrumentSvelteFile(code, filename);
	}
	const result = transform(code, {
		filename,
		plugins: [
			['@babel/plugin-syntax-decorators', {version: 'legacy'}],
			[
				'@babel/plugin-syntax-typescript',
				{
					isTSX: filename.endsWith('.tsx'),
				},
			],
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
