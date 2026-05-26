export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-rouge border-t-transparent" />
        <p className="text-sm font-medium text-gray-400">Chargement…</p>
      </div>
    </div>
  );
}
