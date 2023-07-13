import { signal } from '@preact/signals';

export default {
	recipe: signal(null),
	factor: signal(1),
	per: signal(60),
	timeScale: signal('minute'),
};