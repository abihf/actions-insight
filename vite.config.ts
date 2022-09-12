import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['@prisma/client']
	},
	ssr: {
		external: ['@prisma/client', '.prisma']
	}
};

export default config;
