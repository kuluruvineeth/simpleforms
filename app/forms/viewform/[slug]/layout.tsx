import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto my-6 md:mt-16 sm:my-24 w-full max-w-xs sm:max-w-4xl">
      {children}
    </div>
  );
}
