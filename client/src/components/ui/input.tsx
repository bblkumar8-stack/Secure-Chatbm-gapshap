import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}
