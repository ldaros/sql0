import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const QueryResultTable = ({ queryResult }: { queryResult: any[] }) => {
    return (
      <ScrollArea className="h-full">
        {queryResult.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(queryResult[0]).map((key) => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryResult.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, cellIndex) => (
                    <TableCell
                      className="text-sm text-gray-500"
                      key={cellIndex}
                    >
                      {String(value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-center p-4">No results to display</p>
        )}
      </ScrollArea>
    )
  }