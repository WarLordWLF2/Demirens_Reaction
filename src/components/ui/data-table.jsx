import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronsUpDown } from "lucide-react";

const DataTable = ({
  columns,
  data,
  itemsPerPage = 10,
  autoIndex = false,
  title,
  add,
  hideSearch = false,
  onRowClick,
  idAccessor,
  headerAction,
  tableCaption,
  isSelectable = false,
  selectedData,
  limitNumberWords = true,
  hideHeader = false,
  headerClassName
  //additionalAccessor
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (accessor) => {
    const newSortOrder = sortColumn === accessor && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(accessor);
    setSortOrder(newSortOrder);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    return data
      .filter((row) =>
        columns.some((column) => {
          const value = typeof column.accessor === 'function'
            ? column.accessor(row)
            : row[column.accessor];
          return String(value || '')
            .toLowerCase()
            .includes(lowerSearchTerm);
        })
      )
      .sort((a, b) => {
        if (!sortColumn) return 0;
        const aValue = typeof sortColumn === 'function' ? sortColumn(a) : a[sortColumn];
        const bValue = typeof sortColumn === 'function' ? sortColumn(b) : b[sortColumn];

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, columns, searchTerm, sortColumn, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const truncateText = (text, index) => {
    if (limitNumberWords === true) {
      const maxWords = 15; //caps words to display on table
      const words = String(text ?? '').split(' ');
      return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '…' : text;
    }
    return text;
  };

  const handleRowSelect = (rowIdentifier) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowIdentifier)) {
      newSelectedRows.delete(rowIdentifier);
    } else {
      newSelectedRows.add(rowIdentifier);
    }
    setSelectedRows(newSelectedRows);
    selectedData && selectedData(Array.from(newSelectedRows).map(id => data.find(row => (idAccessor ? row[idAccessor] : row) === id)));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === currentItems.filter(Boolean).length) {
      setSelectedRows(new Set());
      if (selectedData) selectedData([]);
    } else {
      const rowsToSelect = currentItems.filter(Boolean);
      const newSelectedRows = new Set(rowsToSelect.map(row => (idAccessor ? row?.[idAccessor] : row)));
      setSelectedRows(newSelectedRows);
      selectedData && selectedData(Array.from(newSelectedRows).map(id => data.find(row => (idAccessor ? row?.[idAccessor] : row) === id)));
    }
  };

  const renderPaginationItems = () => {
    let items = [];
    let maxVisiblePages;

    if (windowWidth < 640) {
      maxVisiblePages = 1;
    } else if (windowWidth < 768) {
      maxVisiblePages = 2;
    } else {
      maxVisiblePages = 3;
    }

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > maxVisiblePages) {
        items.push(<PaginationEllipsis key="ellipsis-start" />);
      }

      const start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(start + maxVisiblePages - 1, totalPages - 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div>
      {hideHeader ? null : (
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-start sm:items-center mb-4`}>
          <div className={`flex items-center gap-2 mb-2 sm:mb-0 ${headerClassName || ''}`}>
            {title && <h2 className="text-xl font-bold p-3">{title}</h2>}
            {add && add}
            {headerAction && headerAction}
          </div>
          <div className="flex w-full p-3 md:w-1/2 md:justify-end">
            {!hideSearch && data.length > 0 && (
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className={`${isMobile ? 'w-full' : 'max-w-xs'} bg-background text-foreground`}
              />
            )}
          </div>
        </div>
      )}
      {filteredData.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              {tableCaption && <TableCaption>{tableCaption}</TableCaption>}
              <TableHeader>
                <TableRow>
                  {isSelectable && (
                    <TableHead>
                      <Checkbox
                        checked={selectedRows.size === currentItems.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  {autoIndex && <TableHead>#</TableHead>}
                  {columns.map((column, index) =>
                    (!isMobile || !column.hiddenOnMobile) && (
                      <TableHead
                        key={index}
                        onClick={() => column.sortable && handleSort(column.accessor)}
                        className={`${column.sortable ? 'cursor-pointer' : ''} ${column.headerClassName || ''}`}
                      >
                        <div className="flex items-center gap-1">
                          {column.header}
                          {column.sortable && <ChevronsUpDown className="h-4 w-4" />}
                        </div>
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((row, rowIndex) => {
                  if (!row) return null;
                  const rowIdentifier = idAccessor ? row[idAccessor] : row;
                  const isRowSelected = selectedRows.has(rowIdentifier);
                  return (
                    <TableRow
                      key={rowIndex}
                      onClick={() => {
                        if (isSelectable) {
                          handleRowSelect(rowIdentifier);
                        } else if (onRowClick) {
                          onRowClick(rowIdentifier);
                        }
                      }}
                      className={`${(isSelectable || onRowClick) ? 'cursor-pointer' : ''} ${isSelectable && isRowSelected ? 'bg-muted/40' : ''}`}
                    >
                      {isSelectable && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(rowIdentifier)}
                            onCheckedChange={() => handleRowSelect(rowIdentifier)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {autoIndex && (
                        <TableCell>
                          {(currentPage - 1) * itemsPerPage + rowIndex + 1}
                        </TableCell>
                      )}
                      {columns.map((column, colIndex) =>
                        (!isMobile || !column.hiddenOnMobile) && (
                          <TableCell
                            key={colIndex}
                            className={typeof column.className === 'function' ? column.className(row) : column.className || ''}
                          >
                            {truncateText(
                              column.cell
                                ? column.cell(row, (currentPage - 1) * itemsPerPage + rowIndex)
                                : column.additionalAccessor
                                  ? column.additionalAccessor(row)
                                  : typeof column.accessor === 'function'
                                    ? column.accessor(row)
                                    : row[column.accessor]
                            , rowIndex)}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className="cursor-pointer"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    className="cursor-pointer"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        <div className="text-center py-4">No data found
          {/* {String(JSON.stringify(data))} */}
        </div>
      )}
    </div>
  );
};

export default DataTable;