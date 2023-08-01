/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import {build, files, prerendered, version} from '$service-worker';

const CACHE = `cache-${version}`;

const ASSETS = [...build.map((file) => file.replace(/\/index\.html$/, '/')), ...prerendered, ...files];

const splitAssets = (assets: string[]) => {
	const withHash: string[] = [];
	const withoutHash: string[] = [];
	const hashRegExp = /[.-]\w{8,}\.\w{2,4}$/;
	for (const asset of assets) {
		(hashRegExp.test(asset) ? withHash : withoutHash).push(asset);
	}
	return {withHash, withoutHash};
};

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			const {withHash, withoutHash} = splitAssets(ASSETS);
			const missingWithHash: string[] = [];
			for (const url of withHash) {
				const response = await caches.match(url);
				if (response?.ok) {
					cache.put(url, response);
				} else {
					missingWithHash.push(url);
				}
			}
			await cache.addAll([...missingWithHash, ...withoutHash]);
			await self.skipWaiting();
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			await self.clients.claim();
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
		})()
	);
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	if (event.request.method === 'GET' && ASSETS.includes(url.pathname)) {
		event.respondWith(
			(async () => {
				const cache = await caches.open(CACHE);
				const response = await cache.match(url.pathname);
				return response!;
			})()
		);
	}
});
