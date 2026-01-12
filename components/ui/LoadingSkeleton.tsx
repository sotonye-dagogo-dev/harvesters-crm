import { Skeleton } from "antd";

interface LoadingSkeletonProps {
  rows?: number;
  avatar?: boolean;
  active?: boolean;
}

export default function LoadingSkeleton({
  rows = 3,
  avatar = false,
  active = true,
}: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      <Skeleton avatar={avatar} active={active} paragraph={{ rows }} />
    </div>
  );
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    </div>
  );
}
