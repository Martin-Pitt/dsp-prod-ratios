import { resolve } from 'node:path';
import ChildProcess from 'node:child_process';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

const commitHash = ChildProcess.execSync('git rev-parse --short HEAD').toString().trim();


export default defineConfig({
	plugins: [
		preact()
	],
	base: '/',
	build: {
		// https://vitejs.dev/guide/build.html#multi-page-app
		rollupOptions: {
			input: {
				index: resolve(__dirname, 'index.html'),
			}
		}
	},
	define: {
		'import.meta.env.BUILD_AT': JSON.stringify(new Date()),
		'import.meta.env.BUILD_COMMIT': JSON.stringify(commitHash),
	},
});

