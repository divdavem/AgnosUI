import type {Frameworks} from '$lib/stores';
import type {Project} from '@stackblitz/sdk';
import stackblitz from '@stackblitz/sdk';
import type {AsyncFilesSet, SampleInfo} from '../layout/sample';

type StackblitzProcessor = (project: Project, sample: SampleInfo, framework: Frameworks) => Promise<void>;

const addAsyncFiles =
	(files: AsyncFilesSet, prefix = '', removePrefix?: string) =>
	async (project: Project) => {
		await Promise.all(
			Object.keys(files).map(async (fileName) => {
				const finalName = prefix + (removePrefix && fileName.startsWith(removePrefix) ? fileName.substring(removePrefix.length) : fileName);
				project.files[finalName] = await files[fileName]();
			})
		);
	};

const demoCSS: StackblitzProcessor = async (project) => {
	project.files['src/demo.scss'] = (await import('@agnos-ui/common/demo.scss?raw')).default;
};

const frameworkCreateStackblitz: Record<Frameworks, StackblitzProcessor[]> = {
	angular: [
		addAsyncFiles(import.meta.glob('./angular/**', {as: 'raw', import: 'default'}) as any, '', './angular/'),
		async (project, sample) => {
			project.files[
				'src/main.ts'
			] = `import {bootstrapApplication} from '@angular/platform-browser';\nimport MainComponent from './${sample.files.angular.entryPoint.replace(
				/\.ts$/,
				''
			)}';\nbootstrapApplication(MainComponent).catch((err) => console.error(err));`;
		},
	],
	react: [
		addAsyncFiles(import.meta.glob('./react/**', {as: 'raw', import: 'default'}) as any, '', './react/'),
		async (project, sample) => {
			project.files['src/main.tsx'] = `import "./demo.scss";\nimport {createRoot} from "react-dom/client";\nimport App from ${JSON.stringify(
				`./${sample.files.react.entryPoint.replace(/\.tsx?$/, '')}`
			)};\nconst rootElement = document.getElementById('root');\nconst root = createRoot(rootElement);\nroot.render(<App />)`;
		},
	],
	svelte: [
		addAsyncFiles(import.meta.glob('./svelte/**', {as: 'raw', import: 'default'}) as any, '', './svelte/'),
		async (project, sample) => {
			project.files['src/main.ts'] = `import "./demo.scss";\nimport App from ${JSON.stringify(
				`./${sample.files.svelte.entryPoint}`
			)};\nconst app = new App({target: document.getElementById('root')});\nexport default app;`;
			project.template = 'node';
		},
	],
};

const isReleased = import.meta.env.AGNOSUI_VERSION !== '0.0.0';

if (isReleased) {
	const setPackageJsonVersion: StackblitzProcessor = async ({files}, sample, framework) => {
		const packageJson = JSON.parse(files['package.json']);
		packageJson.devDependencies[`@agnos-ui/${framework}`] = import.meta.env.AGNOSUI_VERSION;
		files['package.json'] = JSON.stringify(packageJson, null, '\t');
	};
	frameworkCreateStackblitz.angular.push(setPackageJsonVersion);
	frameworkCreateStackblitz.svelte.push(setPackageJsonVersion);
	frameworkCreateStackblitz.react.push(setPackageJsonVersion);
} else {
	const mergePackageJson: StackblitzProcessor = async ({files}) => {
		const packageJson = JSON.parse(files['package.json']);
		for (const file of Object.keys(files)) {
			if (file.startsWith('packages/') && file.endsWith('/package.json')) {
				const pkg = JSON.parse(files[file]);
				packageJson.devDependencies[pkg.name] = `file:./packages/${pkg.name}`;
				for (const key of Object.keys(pkg.dependencies)) {
					if (!files[`packages/${key}/package.json`]) {
						packageJson.devDependencies[key] = pkg.dependencies[key];
					}
				}
			}
		}
		files['package.json'] = JSON.stringify(packageJson, null, '\t');
	};

	const corePackage = addAsyncFiles(
		import.meta.glob(['../../../../core/dist/lib/**', '../../../../core/package.json', '!**/tsdoc-metadata.json', '!**/*.{map,js}'], {
			as: 'raw',
			import: 'default',
		}) as any,
		'packages/@agnos-ui/core/',
		'../../../../core/'
	);
	frameworkCreateStackblitz.angular.push(
		corePackage,
		addAsyncFiles(
			import.meta.glob(['../../../../angular/dist/lib/**', '!**/tsdoc-metadata.json', '!**/*.map'], {
				as: 'raw',
				import: 'default',
			}) as any,
			'packages/@agnos-ui/angular/',
			'../../../../angular/dist/lib/'
		),
		mergePackageJson
	);
	frameworkCreateStackblitz.react.push(
		corePackage,
		addAsyncFiles(
			import.meta.glob(['../../../../react/dist/lib/**', '../../../../react/package.json', '!**/tsdoc-metadata.json', '!**/*.map'], {
				as: 'raw',
				import: 'default',
			}) as any,
			'packages/@agnos-ui/react/',
			'../../../../react/'
		),
		mergePackageJson
	);
	frameworkCreateStackblitz.svelte.push(
		corePackage,
		addAsyncFiles(
			import.meta.glob(['../../../../svelte/dist/lib/**', '../../../../svelte/package.json', '!**/tsdoc-metadata.json', '!**/*.{map,cjs}'], {
				as: 'raw',
				import: 'default',
			}) as any,
			'packages/@agnos-ui/svelte/',
			'../../../../svelte/'
		),
		mergePackageJson
	);
}

export const openInStackblitz = async (sample: SampleInfo, framework: Frameworks) => {
	const project: Project = {
		title: `AgnosUI ${framework} demo - ${sample.componentName} - ${sample.sampleName}`,
		files: {},
		template: 'node',
	};
	const filesInfo = sample.files[framework];
	const {entryPoint, files} = filesInfo;
	const processors = [addAsyncFiles(files, 'src/'), demoCSS, ...frameworkCreateStackblitz[framework]];
	for (const processor of processors) {
		await processor(project, sample, framework);
	}
	const openFile = [entryPoint, ...Object.keys(files).filter((file) => file != entryPoint)].map((file) => `src/${file}`).join(',');
	stackblitz.openProject(project, {newWindow: true, openFile});
};
