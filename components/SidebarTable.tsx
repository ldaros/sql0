import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Play, RefreshCw, TableIcon, Trash } from "lucide-react";

interface SidebarTableItemProps {
  table: { tableName: string, columns: string[] };
  handleTableAction: (table: string, action: string) => void;
}

const TableAction = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) => (
  <DropdownMenuItem onSelect={onClick}>
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </DropdownMenuItem>
);

export const SidebarTableItem: React.FC<SidebarTableItemProps> = ({ table, handleTableAction }) => {
  const actions = [
    { icon: Play, label: "SELECT", action: "select" },
    { icon: RefreshCw, label: "UPDATE", action: "update" },
    { icon: Trash, label: "DROP", action: "drop" },
  ];

  return (
    <li className="py-1 px-2 hover:bg-gray-200 rounded text-gray-600">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full text-left flex items-center">
          <TableIcon className="w-4 h-4 mr-2" />
          {table.tableName}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {actions.map(({ icon, label, action }) => (
            <TableAction
              key={action}
              icon={icon}
              label={label}
              onClick={() => handleTableAction(table.tableName, action)}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
};