import type { Request } from 'express';

export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPageParams(req: Request, defaultLimit = 12, maxLimit = 50): PageParams {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(req.query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    hasNextPage: page * limit < total,
  };
}
