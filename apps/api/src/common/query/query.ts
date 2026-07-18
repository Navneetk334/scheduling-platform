import { z } from 'zod';

/**
 * Reusable list-query contract: pagination (page or cursor), sorting,
 * filtering, and full-text-ish search. Endpoints compose this with their own
 * allowed sort/filter fields.
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().trim().max(200).optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Prisma `skip`/`take` from a page-based query. */
export function toPrismaPage(query: Pick<ListQuery, 'page' | 'limit'>): {
  skip: number;
  take: number;
} {
  return { skip: (query.page - 1) * query.limit, take: query.limit };
}

/** Build a Prisma `orderBy` restricted to an allow-list of sortable fields. */
export function toPrismaOrderBy<F extends string>(
  query: Pick<ListQuery, 'sort' | 'order'>,
  allowed: readonly F[],
  fallback: F,
): Record<string, 'asc' | 'desc'> {
  const field = query.sort && (allowed as readonly string[]).includes(query.sort) ? query.sort : fallback;
  return { [field]: query.order };
}

export function paginate<T>(data: T[], total: number, query: Pick<ListQuery, 'page' | 'limit'>): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    },
  };
}
