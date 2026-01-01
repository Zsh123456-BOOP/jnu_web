export function getPagination(query, defaults = {}) {
  const defaultPageSize = defaults.pageSize || 20;
  const maxPageSize = defaults.maxPageSize || 100;

  let page = Number.parseInt(query.page, 10);
  let pageSize = Number.parseInt(query.pageSize, 10);

  if (Number.isNaN(page) || page < 1) {
    page = 1;
  }

  if (Number.isNaN(pageSize) || pageSize < 1) {
    pageSize = defaultPageSize;
  }

  pageSize = Math.min(pageSize, maxPageSize);

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize
  };
}
