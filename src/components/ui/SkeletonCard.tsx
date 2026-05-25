export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 flex flex-col gap-3">
        <div className="space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-full" />
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-2 mt-1">
          <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
