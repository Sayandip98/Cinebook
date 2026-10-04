export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export const parsePagination = (
  { page, limit } = {},
  { defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT } = {},
) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const requestedLimit = Number.parseInt(limit, 10) || defaultLimit;
  const safeLimit = Math.min(Math.max(1, requestedLimit), maxLimit);

  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
};

export const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
