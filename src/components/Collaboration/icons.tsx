import React from "react";

const iconBase = "inline-block shrink-0";

type IconProps = { className?: string };

function SvgIcon({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${iconBase} ${className}`}
    >
      {children}
    </svg>
  );
}

export function ArrowRight({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </SvgIcon>
  );
}

export function BarChart3({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-6" />
      <path d="M20 20V8" />
    </SvgIcon>
  );
}

export function Building2({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <rect x="4" y="3" width="10" height="18" rx="1.5" />
      <path d="M14 8h6v13h-6" />
      <path d="M8 7h2" />
      <path d="M8 11h2" />
      <path d="M8 15h2" />
      <path d="M17 12h.01" />
      <path d="M17 16h.01" />
    </SvgIcon>
  );
}

export function CheckCircle2({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.3 2.3 4.7-5.3" />
    </SvgIcon>
  );
}

export function Clock3({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

export function FolderOpen({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M3 19V7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2" />
      <path d="M3 19l2.5-7h15.5l-2.5 7H3Z" />
    </SvgIcon>
  );
}

export function Leaf({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M6 19c8 0 12-6 12-14C10 5 6 9 6 17c0 .7 0 1.3.1 2Z" />
      <path d="M6 17c3-2 6-4 9-8" />
    </SvgIcon>
  );
}

export function MessageSquare({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
    </SvgIcon>
  );
}

export function Paperclip({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="m9 12 6.8-6.8a3 3 0 1 1 4.2 4.2l-8.5 8.5a5 5 0 0 1-7.1-7.1l8.2-8.2" />
    </SvgIcon>
  );
}

export function Plus({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </SvgIcon>
  );
}

export function Sparkles({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="m19 15 .7 1.8L21.5 17l-1.8.7L19 19.5l-.7-1.8-1.8-.7 1.8-.2L19 15Z" />
      <path d="m5 14 .9 2.4L8.3 17l-2.4.9L5 20.3l-.9-2.4L1.7 17l2.4-.6L5 14Z" />
    </SvgIcon>
  );
}

export function X({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </SvgIcon>
  );
}
