import type { PrismaClient } from '@prisma/client';

export async function listRepo(p: PrismaClient, userId?: string | bigint) {
	return p.repo.findMany({
		where: {
			access: {
				some: {
					user_id: userId ? BigInt(userId) : undefined,
				},
			},
		},
	});
}
