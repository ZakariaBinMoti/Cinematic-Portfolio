"use client";

import { useState } from "react";
import {
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Server,
  Cloud,
  Database,
  Lock,
  Mail,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Label, Card, Badge, PageHeader } from "../../_ui";
import { changePassword } from "./actions";

interface SettingsClientProps {
  email: string;
  system: {
    nodeEnv: string;
    hasCloudinary: boolean;
    cloudinaryCloud: string;
    hasMongo: boolean;
    mongoHost: string;
  };
}

export default function SettingsClient({ email, system }: SettingsClientProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdating(true);
    const toastId = toast.loading("Updating password...");

    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success("Admin password successfully updated!", { id: toastId });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Failed to change password", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        eyebrow="Console Administration"
        title="Settings & Security"
        description="Manage your admin authentication, credentials, and verify external service connections."
      />

      <div className="grid gap-6">
        {/* Account Info Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">Administrator Account</h3>
                <p className="text-xs text-[var(--a-text-muted)]">Signed in as primary portfolio owner</p>
              </div>
            </div>
            <Badge tone="violet">Super Admin</Badge>
          </div>

          <div className="mt-4 flex items-center justify-between py-2 text-sm">
            <span className="text-gray-400">Email Address</span>
            <span className="font-mono text-white font-medium">{email}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-sm border-t border-white/5">
            <span className="text-gray-400">Session Status</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active JWT Session
            </span>
          </div>
        </Card>

        {/* Password Change Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">Change Password</h3>
              <p className="text-xs text-[var(--a-text-muted)]">
                Update your admin password encrypted via bcrypt
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 max-w-md">
            <div>
              <Label htmlFor="curr-pass">Current Password</Label>
              <div className="relative">
                <Input
                  id="curr-pass"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-pass">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pass"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-pass">Confirm New Password</Label>
              <Input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>

            <Button type="submit" size="sm" loading={updating} className="gap-1.5 mt-2 shadow-lg">
              <Check className="h-4 w-4" /> Update Password
            </Button>
          </form>
        </Card>

        {/* System & Integrations Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <Server className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">System Integrations</h3>
              <p className="text-xs text-[var(--a-text-muted)]">Connected cloud infrastructure and services</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            <div className="py-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <Database className="h-4 w-4 text-violet-400" />
                <span className="text-gray-300">Database Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{system.mongoHost}</span>
                <Badge tone="green">Connected</Badge>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <Cloud className="h-4 w-4 text-cyan-400" />
                <span className="text-gray-300">Media CDN (Cloudinary)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Cloud: {system.cloudinaryCloud}</span>
                <Badge tone={system.hasCloudinary ? "green" : "amber"}>
                  {system.hasCloudinary ? "Ready" : "Incomplete"}
                </Badge>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-gray-300">Environment</span>
              </div>
              <Badge tone="cyan">{system.nodeEnv}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
