import App from './App.svelte';
import {mount} from 'svelte';
import '@agnos-ui/style-bootstrap/scss/agnosui.scss';

mount(App, {target: document.getElementById('root')!});
