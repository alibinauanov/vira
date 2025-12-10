type UsePaginationProps = {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number;
};

type PaginationResult = {
  pages: number[];
  showLeftEllipsis: boolean;
  showRightEllipsis: boolean;
};

export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 3,
}: UsePaginationProps): PaginationResult {
  const visible = Math.max(1, paginationItemsToDisplay);
  const pages: number[] = [];

  if (totalPages <= visible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return { pages, showLeftEllipsis: false, showRightEllipsis: false };
  }

  const start = Math.max(2, currentPage - Math.floor(visible / 2));
  const end = Math.min(totalPages - 1, start + visible - 1);
  const adjustedStart = Math.max(2, end - visible + 1);

  pages.push(1);
  for (let i = adjustedStart; i <= end; i++) {
    pages.push(i);
  }
  if (!pages.includes(totalPages)) pages.push(totalPages);

  return {
    pages,
    showLeftEllipsis: adjustedStart > 2,
    showRightEllipsis: end < totalPages - 1,
  };
}
