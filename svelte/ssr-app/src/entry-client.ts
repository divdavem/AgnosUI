import 'bootstrap/dist/css/bootstrap.min.css';
import '@agnos-ui/style-bootstrap/css/agnosui.css';
import App from './App.svelte';

const app = new App({
	target: document.getElementById('app')!,
	hydrate: true
});

export default app;
