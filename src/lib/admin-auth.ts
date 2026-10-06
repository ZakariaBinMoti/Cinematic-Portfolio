import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Guard for admin server actions. Middleware protects /admin pages, but
 * server actions are plain POST endpoints, so each one must verify the
 * session itself.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  return session;
}
