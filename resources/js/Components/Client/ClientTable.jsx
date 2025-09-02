import React from "react";
import DataTable from "@/Components/ui/DataTable";
import { clientColumns } from "./constants.jsx";

export default function ClientTable({
    data,
    onEdit,
    onDelete
}) {
    const columnsWithActions = clientColumns.map(col => {
        if (col.key === "actions") {
            return {
                ...col,
                render: (item) => col.render(item, { onEdit, onDelete })
            };
        }
        return col;
    });

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-4">
            <DataTable
                columns={columnsWithActions}
                data={data}
                searchable
                sortable
                pagination={false}
            />
        </div>
    );
}
