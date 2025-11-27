"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CSVRecord } from "@/lib/csv-utils";

interface DataTableProps {
  data: CSVRecord[];
  headers: string[];
  pageSize?: number;
}

export function DataTable({ data, headers, pageSize = 50 }: DataTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  // Reset to page 1 when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Determine which columns to display
  const displayColumns = React.useMemo(() => {
    // Prioritize common columns
    const priorityColumns = ['name', 'name_2', 'phone', 'landline', 'whatsappnumber', 'email', 'location', 'location_2', 'building', 'building_2', 'building_3'];
    const availableColumns = headers.filter(h => priorityColumns.includes(h.toLowerCase()));

    // Add any remaining columns up to 8 total
    const remainingHeaders = headers.filter(h => !availableColumns.includes(h));
    const columnsToShow = [...availableColumns, ...remainingHeaders].slice(0, 8);

    return columnsToShow;
  }, [headers]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              {displayColumns.map((header) => (
                <TableHead key={header} className="font-semibold">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, index) => (
              <TableRow key={startIndex + index}>
                <TableCell className="text-muted-foreground">
                  {startIndex + index + 1}
                </TableCell>
                {displayColumns.map((header) => (
                  <TableCell key={header}>
                    {row[header] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{" "}
          {data.length} records
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
