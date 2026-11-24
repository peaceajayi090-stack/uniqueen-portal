"use client";

export function ConfirmButton({ children, message, className = "btn small danger" }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function PrintButton({ label = "Print / save as PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn small secondary no-print" onClick={() => window.print()}>
      {label}
    </button>
  );
}
