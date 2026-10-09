import {transformSecrets} from "./secret-vault";

import { randomUUID } from "crypto";
import { validateEnv } from "./api-utils";
import { createPostgrestClient } from "./postgrest";

type QueryFilters = Record<string, unknown>;

interface FindManyParams {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    direction: "asc" | "desc";
  };
}

export default class CrudOperations {
  constructor(private tableName: string, private token?: string) {}

  private getClient() {
    validateEnv();
    return createPostgrestClient(this.token);
  }

  private formatErrorMessage(action: string, error: unknown): never {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Failed to ${action} ${this.tableName}: ${message}`);
  }

  private prepareCreateData(data: Record<string, unknown>): Record<string, unknown> {
    if (this.tableName !== "trips") {
      return data;
    }

    const tripUuid = data?.trip_uuid;

    if (typeof tripUuid === "string" && tripUuid.trim()) {
      return data;
    }

    return {
      ...data,
      trip_uuid: randomUUID(),
    };
  }

  async findMany(filters?: QueryFilters, params?: FindManyParams): Promise<any[]> {
    const { limit, offset, orderBy } = params || {};

    try {
      const client = this.getClient();
      let query = client.from(this.tableName).select("*");

      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.direction === "asc",
        });
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      if (typeof limit === "number" && typeof offset === "number") {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map((row: Record<string, unknown>) => transformSecrets(this.tableName, row, false));
    } catch (error) {
      this.formatErrorMessage("fetch", error);
    }
  }

  async findById(id: string | number): Promise<any> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }

        throw new Error(error.message);
      }

      return data ? transformSecrets(this.tableName, data, false) : null;
    } catch (error) {
      this.formatErrorMessage("fetch", error);
    }
  }

  async create(data: Record<string, unknown>): Promise<any> {
    try {
      const client = this.getClient();
      const createData = transformSecrets(this.tableName, this.prepareCreateData(data), true);
      const res = await client
        .from(this.tableName)
        .insert([createData])
        .select()
        .single();

      const { data: result, error } = res;

      if (error) {
        throw new Error(error.message);
      }

      return result ? transformSecrets(this.tableName, result, false) : null;
    } catch (error) {
      this.formatErrorMessage("create", error);
    }
  }

  async update(id: string | number, data: Record<string, unknown>): Promise<any> {
    try {
      const client = this.getClient();
      const { data: result, error } = await client
        .from(this.tableName)
        .update(transformSecrets(this.tableName, data, true))
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return result ? transformSecrets(this.tableName, result, false) : null;
    } catch (error) {
      this.formatErrorMessage("update", error);
    }
  }

  async delete(id: string | number) {
    try {
      const client = this.getClient();
      const { error } = await client
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return { id };
    } catch (error) {
      this.formatErrorMessage("delete", error);
    }
  }
}
