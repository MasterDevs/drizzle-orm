import { Query, SQL } from 'drizzle-orm/sql';
import { SQLiteDialect } from '~/dialect';
import { SelectFieldsOrdered } from './operations';

export interface PreparedQueryConfig {
	type: 'sync' | 'async';
	run: unknown;
	all: unknown[];
	get: unknown;
	values: unknown[][];
}

export abstract class PreparedQuery<T extends PreparedQueryConfig> {
	abstract run(placeholderValues?: Record<string, unknown>): ResultKind<T['type'], T['run']>;

	abstract all(placeholderValues?: Record<string, unknown>): ResultKind<T['type'], T['all']>;

	abstract get(placeholderValues?: Record<string, unknown>): ResultKind<T['type'], T['get']>;

	abstract values(placeholderValues?: Record<string, unknown>): ResultKind<T['type'], T['values']>;

	finalize(): void {}
}

export abstract class SQLiteSession<TResultKind extends 'sync' | 'async' = 'sync' | 'async', TRunResult = unknown> {
	constructor(protected dialect: SQLiteDialect) {
	}

	abstract prepareQuery(
		query: Query,
		fields?: SelectFieldsOrdered,
	): PreparedQuery<PreparedQueryConfig & { type: TResultKind }>;

	run(query: SQL): ResultKind<TResultKind, TRunResult> {
		return this.prepareQuery(this.dialect.sqlToQuery(query)).run();
	}

	all<T = unknown>(query: SQL): ResultKind<TResultKind, T[]> {
		return this.prepareQuery(this.dialect.sqlToQuery(query)).all();
	}

	get<T = unknown>(query: SQL): ResultKind<TResultKind, T> {
		return this.prepareQuery(this.dialect.sqlToQuery(query)).get();
	}

	values<T extends any[] = unknown[]>(query: SQL): ResultKind<TResultKind, T[]> {
		return this.prepareQuery(this.dialect.sqlToQuery(query)).values();
	}
}

interface ResultHKT {
	readonly $brand: 'ResultHKT';
	readonly config: unknown;
	readonly type: unknown;
}

interface SyncResultHKT extends ResultHKT {
	readonly type: this['config'];
}

interface AsyncResultHKT extends ResultHKT {
	readonly type: Promise<this['config']>;
}

export type ResultKind<TType extends 'sync' | 'async', TResult> =
	(('sync' extends TType ? SyncResultHKT : AsyncResultHKT) & {
		readonly config: TResult;
	})['type'];