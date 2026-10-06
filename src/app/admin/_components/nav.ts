import {
  Briefcase,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  description: string;
  /** Two-key "G then X" shortcut */
  shortcut: string;
}

export const navItems: NavItem[] = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard, description: "Overview and quick actions", shortcut: "D" },
  { name: "Projects", path: "/admin/projects", icon: FolderKanban, description: "Selected work showcase", shortcut: "P" },
  { name: "Experience", path: "/admin/experience", icon: Briefcase, description: "Career timeline", shortcut: "E" },
  { name: "Skills", path: "/admin/skills", icon: Sparkles, description: "Technical arsenal", shortcut: "S" },
  { name: "Content", path: "/admin/content", icon: FileText, description: "Hero and about copy", shortcut: "C" },
  { name: "Settings", path: "/admin/settings", icon: Settings, description: "Account security & system", shortcut: "," },
];

export function isActive(pathname: string, path: string) {
  return path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
}
