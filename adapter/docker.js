//@ts-check
import { nodeFileTrace } from '@vercel/nft';
import {
	copyFileSync,
	mkdirSync,
	readlinkSync,
	realpathSync,
	statSync,
	symlinkSync,
	writeFileSync,
} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @returns {import("@sveltejs/kit").Adapter}
 */
export default function () {
	return {
		name: '@abihf/svelte-adapter-docker',
		async adapt(builder) {
			const buildDir = 'build';
			const staticDir = path.join(buildDir, 'static');

			const tmpDir = builder.getBuildDirectory('docker');

			builder.rimraf(tmpDir);
			builder.rimraf(buildDir);

			const serverFile = fileURLToPath(new URL('./server.js', import.meta.url).href);
			const relativePath = path.posix.relative(tmpDir, builder.getServerDirectory());

			builder.copy(serverFile, `${tmpDir}/index.js`, {
				replace: {
					SERVER: `${relativePath}/index.js`,
					MANIFEST: `${relativePath}/manifest.js`,
				},
			});

			mkdirSync(staticDir, { recursive: true });
			builder.writeClient(staticDir);
			builder.writePrerendered(staticDir);

			const entry = `${tmpDir}/index.js`;
			const traced = await nodeFileTrace([entry], { base: '.' });

			const ancestor = '.';
			writeFileSync(`${buildDir}/server.js`, `import "./${path.relative(ancestor, entry)}";`);

			for (const source of traced.fileList) {
				const relSource = path.relative(ancestor, source);
				if (relSource.startsWith('../') || relSource.startsWith('/'))
					throw new Error(`can not bundle ${source}`);

				const dest = path.join(buildDir, relSource);

				const stats = statSync(source);
				const isDir = stats.isDirectory();
				mkdirSync(path.dirname(dest), { recursive: true });

				let link;
				try {
					link = readlinkSync(source);
				} catch {
					// do nothing
				}
				if (link) {
					symlinkSync(link, dest);
				} else if (!isDir) {
					copyFileSync(source, dest);
				}
			}
		},
	};
}
