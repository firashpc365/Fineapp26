
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={`rounded-lg shimmer-bg ${className}`} 
    />
  );
}

// Pre-built patterns for common UI elements
export function CardSkeleton() {
  return (
    <div className="rounded-[2rem] bg-slate-900/40 border border-white/5 p-8 space-y-6 h-full">
      <div className="flex justify-between items-start">
        <Skeleton className="h-14 w-14 rounded-xl" /> {/* Icon */}
        <div className="space-y-2 flex flex-col items-end">
           <Skeleton className="h-6 w-24 rounded-md" /> {/* Price */}
           <Skeleton className="h-4 w-16 rounded-full" /> {/* Profit badge */}
        </div>
      </div>
      <div className="space-y-3 mt-4">
        <Skeleton className="h-6 w-3/4 rounded-md" /> {/* Title */}
        <div className="flex gap-2">
           <Skeleton className="h-5 w-16 rounded-lg" />
           <Skeleton className="h-5 w-16 rounded-lg" />
        </div>
      </div>
      <div className="pt-6 border-t border-white/5 flex gap-2">
         <Skeleton className="h-10 flex-1 rounded-xl" />
         <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-6 px-8 border-b border-white/5">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  );
}
