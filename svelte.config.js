import adapterAuto from '@sveltejs/adapter-auto';
import adapterDocker from './adapter/docker.js';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({ postcss: true, sourceMap: true }),

	kit: {
		adapter: process.env.SVELTE_ADAPTER === 'docker' ? adapterDocker() : adapterAuto(),
	},
	compilerOptions: {
		enableSourcemap: true,
	},
};

export default config;
