import { Pagination as AntPagination } from "antd";

interface CustomPaginationProps {
  total: number;
  pageSize?: number;
  current?: number;
  onChange?: (page: number, pageSize: number) => void;
  showTotal?: boolean;
  showSizeChanger?: boolean;
}

export default function Pagination({
  total,
  pageSize = 20,
  current = 1,
  onChange,
  showTotal = true,
  showSizeChanger = true,
}: CustomPaginationProps) {
  const defaultShowTotal = (total: number, range: [number, number]) => {
    return `${range[0]}-${range[1]} of ${total} items`;
  };

  return (
    <div className="flex justify-center md:justify-end py-4">
      <AntPagination
        total={total}
        pageSize={pageSize}
        current={current}
        onChange={onChange}
        showTotal={showTotal ? defaultShowTotal : undefined}
        showSizeChanger={showSizeChanger}
        pageSizeOptions={["10", "20", "50", "100"]}
        responsive
      />
    </div>
  );
}
