// See https://kit.svelte.dev/docs/types#app

declare namespace App {
	interface Locals {
		prisma: import('@prisma/client').PrismaClient;
		auth: import('$lib/auth').AuthSession;
	}
	// interface PageData {}
	// interface Platform {}
}
