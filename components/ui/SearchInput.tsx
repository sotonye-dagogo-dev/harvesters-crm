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
      prefix={<SearchOutlined className="text-ds-text-subtle" />}
      className={`
        [&_.ant-input]:rounded-[var(--ds-radius-lg)] 
        [&_.ant-input]:shadow-ds-sm 
        [&_.ant-input]:border-ds-border-base 
        [&_.ant-input]:focus:ring-2 
        [&_.ant-input]:focus:ring-ds-brand-accent 
        [&_.ant-input]:focus:border-ds-brand-accent
        [&_.ant-input]:bg-ds-surface-sunken 
        [&_.ant-input]:text-ds-text-primary
        [&_.ant-input-group-addon]:rounded-r-[var(--ds-radius-lg)]
        [&_.ant-btn-primary]:bg-ds-brand-accent
        [&_.ant-btn-primary]:hover:bg-ds-brand-accent-hover
        [&_.ant-btn-primary]:border-ds-brand-accent
        ${className}
      `.trim()}
    />
  );
}
