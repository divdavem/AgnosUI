<script lang="ts">
	import {selectedFramework$} from '../stores';
	import {pathToRoot$, frameworkLessUrl$} from '../stores';

	export let title: string;
	export let tabs: {title: string; key: string; path: string}[];
	export let tab = '';

	$: isAngular = $selectedFramework$ === 'angular';
	$: isReact = $selectedFramework$ === 'react';
	$: isSvelte = $selectedFramework$ === 'svelte';
</script>

<header class="bg-light pt-4 pb-md-5 px-4 px-lg-5 d-flex mb-3 d-md-block align-items-center title">
	<div class="row mb-4 align-items-end">
		<h1 class="col-auto me-auto me-md-none mb-0">{title}</h1>
		<div class="col">
			<div class="btn-group btn-group-sm me-2" role="group" aria-label="Basic radio toggle button group">
				<a
					href={`${$pathToRoot$}angular/${$frameworkLessUrl$}`}
					class="btn btn-outline-primary"
					class:active={isAngular}
					aria-current={!isAngular || 'page'}>Angular</a
				>
				<a
					href={`${$pathToRoot$}react/${$frameworkLessUrl$}`}
					class="btn btn-outline-primary"
					class:active={isReact}
					aria-current={!isReact || 'page'}>React</a
				>
				<a
					href={`${$pathToRoot$}svelte/${$frameworkLessUrl$}`}
					class="btn btn-outline-primary"
					class:active={isSvelte}
					aria-current={!isSvelte || 'page'}>Svelte</a
				>
			</div>
		</div>
	</div>
	<ul class="nav-tabs px-4 px-lg-5 content-tabset justify-content-md-start justify-content-end nav" role="tablist">
		{#each tabs as { title, key, path }}
			{@const isActive = tab === key}
			<li class="nav-item" role="presentation">
				<a href={`${$pathToRoot$}${$selectedFramework$}${path}`} role="tab" class="nav-link" aria-selected={isActive} class:active={isActive}
					>{title}</a
				>
			</li>
		{/each}
	</ul>
</header>
