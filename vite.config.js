
import { resolve } from 'path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';


export default defineConfig({
	plugins: [preact()],
	base: '/',
	build: {
		// https://vitejs.dev/guide/build.html#multi-page-app
		rollupOptions: {
			input: {
				index: resolve(__dirname, 'index.html'),
			}
		}
	}
});
