import { forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LoaderCircle } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ───────────────────────── Button ───────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-[linear-gradient(135deg,#8b5cf6,#6366f1_50%,#06b6d4)] bg-[length:200%_100%] bg-left hover:bg-right shadow-[0_8px_24px_-8px_rgba(139,92,246,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_10px_30px_-8px_rgba(99,102,241,0.75),inset_0_1px_0_rgba(255,255,255,0.25)]",
  secondary:
    "text-[var(--a-text)] bg-[var(--a-surface-strong)] hover:bg-white/[0.12] border border-[var(--a-border)]",
  outline:
    "text-[var(--a-text-muted)] hover:text-[var(--a-text)] border border-[var(--a-border-strong)] hover:border-white/25 hover:bg-[var(--a-surface)]",
  ghost:
    "text-[var(--a-text-muted)] hover:text-[var(--a-text)] hover:bg-[var(--a-surface-hover)]",
  danger:
    "text-red-300 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:text-red-200",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "a-focus relative inline-flex items-center justify-center font-medium whitespace-nowrap select-none",
        "transition-all duration-300 ease-out active:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

/* ───────────────────────── Inputs ───────────────────────── */

const fieldBase =
  "w-full rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-[var(--a-text)] placeholder:text-[var(--a-text-subtle)] " +
  "transition-[border-color,box-shadow,background-color] duration-200 outline-none " +
  "hover:border-[var(--a-border-strong)] focus:border-violet-400/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)]";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, "h-11 px-3.5 text-sm", className)} {...props} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(fieldBase, "px-3.5 py-3 text-sm leading-relaxed resize-y", className)} {...props} />;
  }
);

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-[13px] font-medium text-[var(--a-text-muted)] mb-1.5", className)} {...props} />;
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-[var(--a-text-subtle)]">{hint}</p>}
    </div>
  );
}

/* ───────────────────────── Card ───────────────────────── */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--a-radius)] border border-[var(--a-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))]",
        className
      )}
      {...props}
    />
  );
}

/* ───────────────────────── Badge ───────────────────────── */

type BadgeTone = "neutral" | "violet" | "cyan" | "green" | "amber" | "red";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-white/[0.06] text-[var(--a-text-muted)] border-white/10",
  violet: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-400/20",
  green: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  amber: "bg-amber-500/10 text-amber-300 border-amber-400/20",
  red: "bg-red-500/10 text-red-300 border-red-400/20",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        badgeTones[tone],
        className
      )}
      {...props}
    />
  );
}

/* ───────────────────────── Kbd ───────────────────────── */

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] px-1.5",
        "font-sans text-[10.5px] font-medium text-[var(--a-text-muted)] shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]",
        className
      )}
      {...props}
    />
  );
}

/* ───────────────────────── PageHeader ───────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] a-gradient-text">{eyebrow}</p>
        )}
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--a-text)] sm:text-[32px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-[var(--a-text-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ───────────────────────── Skeleton ───────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("a-shimmer rounded-lg", className)} />;
}
