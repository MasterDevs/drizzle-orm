import { QueryResult } from 'pg';

import { PgDialect, PgSession } from './connection';
import { AnyPgTable } from './table';

export class PgTestSession implements PgSession {
	private queries: { query: string; params: unknown[] }[] = [];
	private lastQuery: { query: string; params: unknown[] } | undefined;
	private nextResponse: QueryResult | undefined;

	getQueries() {
		return this.queries;
	}

	getLastQuery() {
		return this.lastQuery;
	}

	setNextResponse(response: QueryResult): void {
		this.nextResponse = response;
	}

	async query(query: string, params: unknown[]): Promise<QueryResult> {
		console.log({ query, params });

		this.queries.push({ query, params });
		this.lastQuery = { query, params };

		if (this.nextResponse) {
			const response = this.nextResponse;
			this.nextResponse = undefined;
			return response;
		}

		return {
			rows: [],
			rowCount: 0,
			command: '',
			oid: 0,
			fields: [],
		};
	}
}

export class PgTestDriver {
	async connect(): Promise<PgTestSession> {
		return new PgTestSession();
	}
}

export class PgTestConnector<TDBSchema extends Record<string, AnyPgTable>> {
	dialect: PgDialect<TDBSchema>;
	driver: PgTestDriver;

	constructor(dbSchema: TDBSchema) {
		this.dialect = new PgDialect(dbSchema);
		this.driver = new PgTestDriver();
	}
}