import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { SearchProps } from "antd/es/input";

interface SearchInputProps extends SearchProps {
  className?: string;
}

export function SearchInput({ className = "", ...props }: SearchInputProps) {
  return (
    <Input.Search
      {...props}
      prefix={<SearchOutlined className="text-gray-400" />}
      className={`
        [&_.ant-input]:rounded-lg 
        [&_.ant-input]:shadow-sm 
        [&_.ant-input]:border-gray-300 
        dark:[&_.ant-input]:border-slate-600 
        [&_.ant-input]:focus:ring-2 
        [&_.ant-input]:focus:ring-green-500 
        [&_.ant-input]:focus:border-green-500
        [&_.ant-input]:dark:bg-slate-800 
        [&_.ant-input]:dark:text-white
        [&_.ant-input-group-addon]:rounded-r-lg
        [&_.ant-btn-primary]:bg-green-600
        [&_.ant-btn-primary]:hover:bg-green-700
        [&_.ant-btn-primary]:border-green-600
        ${className}
      `.trim()}
    />
  );
}
