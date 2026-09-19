import type { Metadata } from "next";
import "./globals.css";
import { AIAssistantWidget } from "@/components/layout/AIAssistantWidget";
import { BloombergTerminalWidget } from "@/components/layout/BloombergTerminalWidget";
import { GlobalAuthProvider } from "@/components/auth/GlobalAuthProvider";

export const metadata: Metadata = {
  title: "FinTech Agent OS — Quantitative Financial Intelligence & Overfitting Audit Engine",
  description: "Institutional AI Agent platform for quantitative backtesting, overfitting audit ledgers, quantum QUBO optimization, and AML graph networks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-claude-cream text-claude-surface font-sans antialiased min-h-screen" suppressHydrationWarning>
        <GlobalAuthProvider>
          <div className="pb-12 min-h-screen flex flex-col">
            {children}
          </div>
          <BloombergTerminalWidget />
          <AIAssistantWidget />
        </GlobalAuthProvider>
      </body>
    </html>
  );
}

