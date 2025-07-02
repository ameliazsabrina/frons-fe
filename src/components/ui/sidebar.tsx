import React, { createContext, useContext } from "react";

export const SidebarContext = createContext({});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarContext.Provider value={{}}>{children}</SidebarContext.Provider>
  );
}

export function SidebarInset({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`sidebar-inset ${className}`}>{children}</div>;
}

export function SidebarTrigger({ className = "" }: { className?: string }) {
  // Placeholder trigger
  return <button className={`sidebar-trigger ${className}`}>☰</button>;
}
