import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantum FinTech AgentOS — AI Agent Factory & Quantum Optimization Engine",
  description: "A platform that converts financial objectives into executable AI agents, evaluates them on Bitcoin transaction networks, and optimizes decisions via Quantum QUBO Annealing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-claude-cream text-claude-surface font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
