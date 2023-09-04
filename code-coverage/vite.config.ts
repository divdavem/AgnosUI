import {builtinModules} from 'module';
import {dependencies, peerDependencies} from './package.json';
import path from 'path';
import {defineConfig} from 'vite';

const outDir = path.join(__dirname, 'dist/lib');

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: {
				vitePlugin: './lib/vitePlugin.ts',
				interceptReadFile: './lib/interceptReadFile.ts',
				vitestProvider: './lib/vitestProvider.ts',
				setup: './lib/setup.ts',
				reportCoverage: './lib/reportCoverage.ts',
			},
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: [...Object.keys(dependencies), ...Object.keys(peerDependencies), ...builtinModules],
		},
		emptyOutDir: true,
		outDir,
	},
	plugins: [
		{
			name: 'patch-babel-generator',
			resolveId: {
				order: 'pre',
				async handler(source, importer, options) {
					if (source === '@babel/generator/lib/printer.js' && !importer?.includes('@babel/core')) {
						const resolveFrom = async (importer: string, importedPackage: string) => {
							const resolveInfo = await this.resolve(importedPackage, importer);
							let id = resolveInfo!.id!;
							id = id.replace(/\?.*$/, '');
							id = id.replace('\x00', '');
							return id;
						};
						const babelGenerate = await resolveFrom(importer!, '@babel/core/lib/transformation/file/generate.js');
						const babelGeneratorPrinter = await resolveFrom(babelGenerate, source);
						return {
							external: true,
							id: path.relative(outDir, babelGeneratorPrinter),
						};
					}
				},
			},
		},
	],
});
