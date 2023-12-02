import React from "react";

export function FormContainer({ children }: { children: React.ReactNode }) {
  return <div className="md:px-20 md:mt-20">{children}</div>;
}
