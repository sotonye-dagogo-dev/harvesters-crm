import { Table as AntTable, TableProps } from "antd";
import { useState } from "react";

interface CustomTableProps<T> extends TableProps<T> {
  searchable?: boolean;
}

export default function Table<T extends object>({
  searchable = false,
  ...props
}: CustomTableProps<T>) {
  const [, setSearchText] = useState("");

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-church-primary"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      )}
      <AntTable<T>
        {...props}
        className="custom-table"
        pagination={{
          ...props.pagination,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </div>
  );
}
