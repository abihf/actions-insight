import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { getRequest, setResponse } from '@sveltejs/kit/node';
import { Server } from 'SERVER';
import { manifest } from 'MANIFEST';
import express, { static as serveStatic } from 'express';

installPolyfills();

const server = new Server(manifest);
await server.init({
	env: process.env,
});

const app = express();
app.use(serveStatic('static'), async (req, res) => {
	try {
		const request = await getRequest({ base: `https://${req.hostname}`, request: req }).catch(
			() => {
				const err = new Error('invalid request');
				err.status = 400;
				throw err;
			},
		);
		setResponse(
			res,
			await server.respond(request, {
				getClientAddress() {
					return request.headers.get('x-forwarded-for');
				},
			}),
		);
	} catch (err) {
		res.statusCode = err.status || 500;
		return res.end(err.message);
	}
});

const port = parseInt(process.env.PORT || 8080, 10);
app.listen(port, '0.0.0.0', () => console.log(`listening on http://127.0.0.1:${port}/`));
