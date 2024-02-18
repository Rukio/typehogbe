import {QueryParams} from "../utils/service.util";

export interface SystemIdType {
  id: number;
}

export interface SystemDateTypes {
  created_at: number,
  updated_at: number,
}

export type BodyPayload = Record<string, unknown>;
export type MessageResponse<T = { [key: string]: unknown }> = Promise<{ message: string, data?: T }>;
export type GetManyParams = Omit<QueryParams, "tableName">;
