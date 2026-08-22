import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * WebTaky Neon SQL Database Engine
 * High-performance serverless PostgreSQL connection & fluent query adapter.
 */

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }
  return url;
}

let cachedSql: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  if (!cachedSql) {
    const url = getDatabaseUrl();
    cachedSql = neon(url);
  }
  return cachedSql;
}

async function runQuery(query: string, params: unknown[] = []): Promise<any[]> {
  const sqlClient = getSql();
  const res = await sqlClient.query(query, params as any[]);
  return (res as any)?.rows ?? res;
}

// ─── Fluent Query Builder for PostgreSQL / Neon ───────────────────────

type WhereCondition =
  | { type: "eq"; col: string; val: unknown }
  | { type: "neq"; col: string; val: unknown }
  | { type: "in"; col: string; vals: unknown[] }
  | { type: "gte"; col: string; val: unknown }
  | { type: "lte"; col: string; val: unknown }
  | { type: "gt"; col: string; val: unknown }
  | { type: "lt"; col: string; val: unknown }
  | { type: "ilike"; col: string; val: string }
  | { type: "raw_or"; expr: string };

export class QueryBuilder<T = Record<string, unknown>> implements PromiseLike<{ data: T[] | T | null; count?: number | null; error: Error | null }> {
  private tableName: string;
  private action: "select" | "insert" | "upsert" | "update" | "delete" = "select";
  private isMutation: boolean = false;
  private selectCols: string = "*";
  private insertData: Record<string, unknown> | Record<string, unknown>[] | null = null;
  private updateData: Record<string, unknown> | null = null;
  private upsertConflict: string | null = null;
  private conditions: WhereCondition[] = [];
  private orderByCol: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private offsetCount: number | null = null;
  private isSingle: boolean = false;
  private countMode: "exact" | null = null;
  private isHead: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns = "*", options?: { count?: "exact"; head?: boolean }) {
    if (!this.isMutation) {
      this.action = "select";
    }
    this.selectCols = columns;
    if (options?.count === "exact") this.countMode = "exact";
    if (options?.head) this.isHead = true;
    return this;
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]) {
    this.action = "insert";
    this.isMutation = true;
    this.insertData = data;
    return this;
  }

  upsert(data: Record<string, unknown> | Record<string, unknown>[], options?: { onConflict?: string }) {
    this.action = "upsert";
    this.isMutation = true;
    this.insertData = data;
    if (options?.onConflict) {
      this.upsertConflict = options.onConflict;
    }
    return this;
  }

  update(data: Record<string, unknown>) {
    this.action = "update";
    this.isMutation = true;
    this.updateData = data;
    return this;
  }

  delete() {
    this.action = "delete";
    this.isMutation = true;
    return this;
  }

  eq(col: string, val: unknown) {
    this.conditions.push({ type: "eq", col, val });
    return this;
  }

  neq(col: string, val: unknown) {
    this.conditions.push({ type: "neq", col, val });
    return this;
  }

  in(col: string, vals: unknown[]) {
    this.conditions.push({ type: "in", col, vals });
    return this;
  }

  gte(col: string, val: unknown) {
    this.conditions.push({ type: "gte", col, val });
    return this;
  }

  lte(col: string, val: unknown) {
    this.conditions.push({ type: "lte", col, val });
    return this;
  }

  gt(col: string, val: unknown) {
    this.conditions.push({ type: "gt", col, val });
    return this;
  }

  lt(col: string, val: unknown) {
    this.conditions.push({ type: "lt", col, val });
    return this;
  }

  ilike(col: string, pattern: string) {
    this.conditions.push({ type: "ilike", col, val: pattern });
    return this;
  }

  or(expr: string) {
    this.conditions.push({ type: "raw_or", expr });
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderByCol = col;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  range(from: number, to: number) {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // ─── SQL Compilation & Execution ────────────────────────────────────

  private buildWhereClause(paramOffset = 1): { sql: string; values: unknown[]; nextParamOffset: number } {
    if (this.conditions.length === 0) return { sql: "", values: [], nextParamOffset: paramOffset };

    const clauses: string[] = [];
    const values: unknown[] = [];
    let idx = paramOffset;

    for (const cond of this.conditions) {
      if (cond.type === "eq") {
        if (cond.val === null) {
          clauses.push(`"${cond.col}" IS NULL`);
        } else {
          clauses.push(`"${cond.col}" = $${idx++}`);
          values.push(cond.val);
        }
      } else if (cond.type === "neq") {
        if (cond.val === null) {
          clauses.push(`"${cond.col}" IS NOT NULL`);
        } else {
          clauses.push(`"${cond.col}" != $${idx++}`);
          values.push(cond.val);
        }
      } else if (cond.type === "in") {
        if (cond.vals.length === 0) {
          clauses.push("FALSE");
        } else {
          const placeholders = cond.vals.map(() => `$${idx++}`).join(", ");
          clauses.push(`"${cond.col}" IN (${placeholders})`);
          values.push(...cond.vals);
        }
      } else if (cond.type === "gte") {
        clauses.push(`"${cond.col}" >= $${idx++}`);
        values.push(cond.val);
      } else if (cond.type === "lte") {
        clauses.push(`"${cond.col}" <= $${idx++}`);
        values.push(cond.val);
      } else if (cond.type === "gt") {
        clauses.push(`"${cond.col}" > $${idx++}`);
        values.push(cond.val);
      } else if (cond.type === "lt") {
        clauses.push(`"${cond.col}" < $${idx++}`);
        values.push(cond.val);
      } else if (cond.type === "ilike") {
        clauses.push(`"${cond.col}" ILIKE $${idx++}`);
        values.push(cond.val);
      } else if (cond.type === "raw_or") {
        // Parse Supabase-style or filter e.g. "name_ar.ilike.%foo%,name_en.ilike.%foo%"
        const subParts = cond.expr.split(",").map((part) => {
          const match = part.trim().match(/^([\w_]+)\.(ilike|eq|neq|gte|lte)\.(.*)$/);
          if (!match) return null;
          const [, col, op, valStr] = match;
          const cleanVal = valStr.replace(/^%(.*)%$/, "%$1%");
          if (op === "ilike") {
            values.push(cleanVal);
            return `"${col}" ILIKE $${idx++}`;
          } else if (op === "eq") {
            values.push(cleanVal);
            return `"${col}" = $${idx++}`;
          } else if (op === "neq") {
            values.push(cleanVal);
            return `"${col}" != $${idx++}`;
          }
          return null;
        }).filter(Boolean);

        if (subParts.length > 0) {
          clauses.push(`(${subParts.join(" OR ")})`);
        }
      }
    }

    return {
      sql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
      values,
      nextParamOffset: idx,
    };
  }

  async execute(): Promise<{ data: any; count?: number | null; error: Error | null }> {
    try {
      if (this.action === "select") {
        let count: number | null = null;

        // If count mode is requested
        if (this.countMode === "exact") {
          const whereInfo = this.buildWhereClause(1);
          const countQuery = `SELECT COUNT(*)::int AS count FROM "${this.tableName}" ${whereInfo.sql}`;
          const countRes = await runQuery(countQuery, whereInfo.values);
          count = countRes[0]?.count ?? 0;
          if (this.isHead) {
            return { data: null, count, error: null };
          }
        }

        const whereInfo = this.buildWhereClause(1);
        let query = `SELECT ${this.cleanSelectCols(this.selectCols)} FROM "${this.tableName}" ${whereInfo.sql}`;
        const params = [...whereInfo.values];

        if (this.orderByCol) {
          query += ` ORDER BY "${this.orderByCol}" ${this.orderAsc ? "ASC" : "DESC"}`;
        }

        if (this.limitCount !== null) {
          query += ` LIMIT ${this.limitCount}`;
        }

        if (this.offsetCount !== null) {
          query += ` OFFSET ${this.offsetCount}`;
        }

        const rows = await runQuery(query, params);

        if (this.isSingle) {
          return { data: (rows[0] as T) || null, count, error: null };
        }

        return { data: rows as T[], count, error: null };
      }

      if (this.action === "insert") {
        const records = Array.isArray(this.insertData) ? this.insertData : [this.insertData || {}];
        if (records.length === 0) return { data: [], error: null };

        const cols = Object.keys(records[0]);
        const values: unknown[] = [];
        const valueTuples: string[] = [];
        let pIdx = 1;

        for (const rec of records) {
          const tuple = cols.map((col) => {
            const val = rec[col];
            values.push(typeof val === "object" && val !== null ? JSON.stringify(val) : val);
            return `$${pIdx++}`;
          });
          valueTuples.push(`(${tuple.join(", ")})`);
        }

        const colsEscaped = cols.map((c) => `"${c}"`).join(", ");
        const returnCols = this.cleanSelectCols(this.selectCols);
        const query = `INSERT INTO "${this.tableName}" (${colsEscaped}) VALUES ${valueTuples.join(", ")} RETURNING ${returnCols};`;
        const rows = await runQuery(query, values);

        return { data: this.isSingle ? (rows[0] || null) : rows, error: null };
      }

      if (this.action === "upsert") {
        const records = Array.isArray(this.insertData) ? this.insertData : [this.insertData || {}];
        if (records.length === 0) return { data: [], error: null };

        const cols = Object.keys(records[0]);
        const values: unknown[] = [];
        const valueTuples: string[] = [];
        let pIdx = 1;

        for (const rec of records) {
          const tuple = cols.map((col) => {
            const val = rec[col];
            values.push(typeof val === "object" && val !== null ? JSON.stringify(val) : val);
            return `$${pIdx++}`;
          });
          valueTuples.push(`(${tuple.join(", ")})`);
        }

        const colsEscaped = cols.map((c) => `"${c}"`).join(", ");
        const conflictTarget = this.upsertConflict
          ? this.upsertConflict.split(",").map((c) => `"${c.trim()}"`).join(", ")
          : `"id"`;

        const updateSet = cols
          .filter((c) => !conflictTarget.includes(`"${c}"`))
          .map((c) => `"${c}" = EXCLUDED."${c}"`)
          .join(", ");

        const onConflictClause = updateSet
          ? `ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updateSet}`
          : `ON CONFLICT (${conflictTarget}) DO NOTHING`;

        const returnCols = this.cleanSelectCols(this.selectCols);
        const query = `INSERT INTO "${this.tableName}" (${colsEscaped}) VALUES ${valueTuples.join(", ")} ${onConflictClause} RETURNING ${returnCols};`;
        const rows = await runQuery(query, values);

        return { data: this.isSingle ? (rows[0] || null) : rows, error: null };
      }

      if (this.action === "update") {
        const updateRec = this.updateData || {};
        const updateCols = Object.keys(updateRec);
        if (updateCols.length === 0) return { data: [], error: null };

        const values: unknown[] = [];
        let pIdx = 1;
        const setClauses = updateCols.map((col) => {
          const val = updateRec[col];
          values.push(typeof val === "object" && val !== null ? JSON.stringify(val) : val);
          return `"${col}" = $${pIdx++}`;
        });

        const whereInfo = this.buildWhereClause(pIdx);
        values.push(...whereInfo.values);

        const returnCols = this.cleanSelectCols(this.selectCols);
        const query = `UPDATE "${this.tableName}" SET ${setClauses.join(", ")} ${whereInfo.sql} RETURNING ${returnCols};`;
        const rows = await runQuery(query, values);

        return { data: this.isSingle ? (rows[0] || null) : rows, error: null };
      }

      if (this.action === "delete") {
        const whereInfo = this.buildWhereClause(1);
        const query = `DELETE FROM "${this.tableName}" ${whereInfo.sql} RETURNING *;`;
        const rows = await runQuery(query, whereInfo.values);

        return { data: rows, error: null };
      }

      return { data: null, error: null };
    } catch (err: any) {
      console.error(`[Neon DB Error] in ${this.tableName}:`, err);
      return { data: null, count: 0, error: err };
    }
  }

  private cleanSelectCols(cols: string): string {
    if (!cols || cols === "*") return "*";
    // Strip nested relations e.g. "media_library(file_url, cdn_url)" or "services(slug)"
    const flattened = cols.replace(/\w+\([^)]*\)/g, "").trim();
    const parts = flattened.split(",").map((c) => c.trim()).filter(Boolean);
    const cleaned = parts.map((col) => {
      if (col === "*") return "*";
      return `"${col}"`;
    });
    return cleaned.length > 0 ? cleaned.join(", ") : "*";
  }

  then<TResult1 = { data: any; count?: number | null; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; count?: number | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function createDbClient() {
  return {
    from: <T = Record<string, unknown>>(tableName: string) => new QueryBuilder<T>(tableName),
    sql: getSql(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  };
}

export const db = createDbClient();
