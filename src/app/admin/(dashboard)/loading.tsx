export default function DashboardLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-400 font-medium animate-pulse">Loading data...</p>
    </div>
  );
}
