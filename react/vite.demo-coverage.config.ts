import type {UserConfig, UserConfigFn} from 'vite';
import {defineConfig} from 'vite';
import codeCoverageInstrument from '@agnos-ui/code-coverage/vitePlugin';
import configBuilder from './vite.demo.config';

export default defineConfig((config) => {
	const demoConfig = (configBuilder as UserConfigFn)(config) as UserConfig;
	demoConfig.plugins!.unshift(codeCoverageInstrument());
	return demoConfig;
});
