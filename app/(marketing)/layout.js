import { MarketingNavbar } from "@/components/marketing-navbar";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="relative z-10 min-h-screen flex flex-col">
        <MarketingNavbar />
        <main className="flex-1 pt-14">{children}</main>
      </div>
    </div>
  );
}
