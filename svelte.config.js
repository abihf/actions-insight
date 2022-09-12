import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({ postcss: true, sourceMap: true }),

	kit: {
		adapter: process.env.SK_ADAPTER === 'node' ? adapterNode() : adapterAuto()
	},
	compilerOptions: {
		enableSourcemap: true
	}
};

export default config;
