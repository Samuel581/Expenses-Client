import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";

import {
  ColumnDef,
  flexRender,
  Table as ReactTable,
  RowData,
} from "@tanstack/react-table";

interface ExpenseTableProps<TData extends RowData> {
  table: ReactTable<TData>;
  columns: ColumnDef<TData>[];
  total: number;
}

const ExpenseTable = <TData extends RowData>({
  table,
  columns,
  total,
}: ExpenseTableProps<TData>) => (
  <Table>
    <TableHeader>
      {/* */}
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-24 text-center"
          >
            {" "}
            No results find
          </TableCell>
        </TableRow>
      )}
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={4} className="font-semibold">
          Total
        </TableCell>
        <TableCell className="text-center text-green-600 font-semibold">
          ${total.toFixed(2)}
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableFooter>
  </Table>
);

export default ExpenseTable;
