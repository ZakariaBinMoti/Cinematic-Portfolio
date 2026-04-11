import Link from "next/link";
import SignOutButton from "../components/SignOutButton";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Projects", path: "/admin/projects" },
    { name: "Experience", path: "/admin/experience" },
    { name: "Skills", path: "/admin/skills" },
    { name: "Content", path: "/admin/content" },
  ];

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8 tracking-tighter">Admin Console</h2>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.path} className="block px-4 py-2 rounded border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-colors">
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="pt-8 border-t border-white/10">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
