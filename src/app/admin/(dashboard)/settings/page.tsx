import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemStatus } from "./actions";
import SettingsClient from "./SettingsClient";

export const metadata = { title: "Settings & Security" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const system = await getSystemStatus();

  return (
    <SettingsClient
      email={session?.user?.email || "Admin"}
      system={system}
    />
  );
}
