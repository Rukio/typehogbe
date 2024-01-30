import {QueryParams} from "../utils/service.util";

export interface SystemIdType {
  id: number;
}

export interface SystemDateTypes {
  created_at: number,
  updated_at: number,
}

export type BodyPayload = Record<string, unknown>;
export type MessageResponse = Promise<{ message: string, data?: { [key: string]: unknown } }>;
export type GetManyParams = Omit<QueryParams, "tableName">;
