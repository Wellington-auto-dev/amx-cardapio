interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  style?: React.CSSProperties;
}

const roundedClass = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-2xl', full: 'rounded-full' };

export function Skeleton({ className = '', rounded = 'md', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${roundedClass[rounded]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function ItemCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 flex gap-3"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex-1 flex flex-col gap-2 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-5 w-1/3 mt-1" />
      </div>
      <Skeleton className="w-24 h-24 flex-shrink-0" rounded="lg" />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div
      className="px-4 py-5 flex flex-col items-center gap-3"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <Skeleton className="w-20 h-20" rounded="full" />
      <Skeleton className="h-5 w-40" />
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <div className="flex gap-2 px-4 py-3" style={{ backgroundColor: 'var(--color-background)' }}>
      {[80, 100, 70, 90, 110].map((w, i) => (
        <Skeleton key={i} className="h-8 flex-shrink-0" style={{ width: w }} rounded="full" />
      ))}
    </div>
  );
}
