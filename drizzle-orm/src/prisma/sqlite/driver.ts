import { Prisma } from '@prisma/client';

import type { Logger } from '~/logger.ts';
import { DefaultLogger } from '~/logger.ts';
import { BaseSQLiteDatabase, SQLiteAsyncDialect } from '~/sqlite-core';
import type { DrizzleConfig } from '~/utils.ts';
import { PrismaSQLiteSession } from '.';

export type PrismaSQLiteDatabase = BaseSQLiteDatabase<'async', unknown>;

export type PrismaSQLiteConfig = Omit<DrizzleConfig, 'schema'>;

export function drizzle(config: PrismaSQLiteConfig = {}) {
	const dialect = new SQLiteAsyncDialect();
	let logger: Logger | undefined;
	if (config.logger === true) {
		logger = new DefaultLogger();
	} else if (config.logger !== false) {
		logger = config.logger;
	}

	return Prisma.defineExtension((client) => {
		const session = new PrismaSQLiteSession(client, dialect, { logger });

		return client.$extends({
			name: 'drizzle',
			client: {
				$drizzle: new BaseSQLiteDatabase('async', dialect, session, undefined),
			},
		});
	});
}
