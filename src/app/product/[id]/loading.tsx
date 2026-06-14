export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 font-sans pb-20 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-16 mb-3"></div>
        <div className="h-10 bg-gray-200 rounded w-3/4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/4 mt-4"></div>
      </div>

      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 rounded-2xl w-full"></div>

      {/* Action Skeleton */}
      <div className="pt-6">
        <div className="h-14 bg-gray-200 rounded-xl w-full"></div>
      </div>
    </div>
  );
}
