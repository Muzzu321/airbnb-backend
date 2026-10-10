import {
  PaginationEllipsis,
  PaginationButton,
} from '@/components/ui/pagination';

export const generatePaginationLinks = (
  currentPage,
  totalPages,
  onPageChange,
  className
) => {
  const pages = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PaginationButton
          className={className}
          key={i}
          onClick={() => onPageChange(i)}
          isActive={i === currentPage}
        >
          {i}
        </PaginationButton>
      );
    }
  } else {
    for (let i = 1; i <= 2; i++) {
      pages.push(
        <PaginationButton
          className={className}
          key={i}
          onClick={() => onPageChange(i)}
          isActive={i === currentPage}
        >
          {i}
        </PaginationButton>
      );
    }
    if (2 < currentPage && currentPage < totalPages - 1) {
      pages.push(<PaginationEllipsis className={className} key={'ellipsis'} />);
      pages.push(
        <PaginationButton
          className={className}
          key={currentPage}
          onClick={() => onPageChange(currentPage)}
          isActive={true}
        >
          {currentPage}
        </PaginationButton>
      );
    }
    pages.push(<PaginationEllipsis className={className} key={'ellipsis'} />);
    for (let i = totalPages - 1; i <= totalPages; i++) {
      pages.push(
        <PaginationButton
          className={className}
          key={i}
          onClick={() => onPageChange(i)}
          isActive={i === currentPage}
        >
          {i}
        </PaginationButton>
      );
    }
  }
  return pages;
};
