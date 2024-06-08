import type { PrismaClient } from '@prisma/client/extension';

import { Prisma } from '@prisma/client';

import { entityKind } from '~/entity';
import type { Logger } from '~/logger.ts';
import { DefaultLogger } from '~/logger.ts';
import type { QueryResultHKT } from '~/mysql-core';
import { MySqlDatabase, MySqlDialect } from '~/mysql-core';
import type { DrizzleConfig } from '~/utils.ts';
import type { PrismaMySqlPreparedQueryHKT } from './session';
import { PrismaMySqlSession } from './session';

export class PrismaMySqlDatabase
	extends MySqlDatabase<QueryResultHKT, PrismaMySqlPreparedQueryHKT, Record<string, never>>
{
	static readonly [entityKind]: string = 'PrismaMySqlDatabase';

	constructor(client: PrismaClient, logger: Logger | undefined) {
		const dialect = new MySqlDialect();
		super(dialect, new PrismaMySqlSession(dialect, client, { logger }), undefined, 'default');
	}
}

export type PrismaMySqlConfig = Omit<DrizzleConfig, 'schema'>;

export function drizzle(config: PrismaMySqlConfig = {}) {
	let logger: Logger | undefined;
	if (config.logger === true) {
		logger = new DefaultLogger();
	} else if (config.logger !== false) {
		logger = config.logger;
	}

	return Prisma.defineExtension((client) => {
		return client.$extends({
			name: 'drizzle',
			client: {
				$drizzle: new PrismaMySqlDatabase(client, logger),
			},
		});
	});
}
