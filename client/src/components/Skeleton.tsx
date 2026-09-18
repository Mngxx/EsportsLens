interface SkeletonProps {
    className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
    return <div className={`animate-pulse rounded-md bg-zinc-800 ${className}`} />;
}

export default Skeleton;
