import {sveltekit} from '@sveltejs/kit/vite';
import path from 'path';
import type {ProxyOptions} from 'vite';
import {defineConfig} from 'vite';
import {alias} from '../viteAlias';
import pkg from '../core/package.json';
import {docExtractor} from './scripts/doc.plugin';

const proxy: Record<string, string | ProxyOptions> = {
	'/angular/samples': {
		target: 'http://localhost:4200',
		ws: true,
	},
	'/react/samples': {
		target: 'http://localhost:3000',
		ws: true,
	},
	'/svelte/samples': {
		target: 'http://localhost:3001',
		ws: true,
	},
};

// https://vitejs.dev/config/
export default defineConfig({
	envDir: path.join(__dirname, 'env'),
	server: {
		port: 4000,
		proxy,
	},
	build: {
		emptyOutDir: true,
	},
	preview: {
		port: 4000,
		proxy: process.env.CI === 'true' ? {} : proxy,
	},
	resolve: {
		alias,
	},
	plugins: [sveltekit(), docExtractor()],
	define: {
		'import.meta.env.AGNOSUI_VERSION': JSON.stringify((pkg as any).version ?? '0.0.0'),
	},
});
