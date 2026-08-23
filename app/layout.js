import "./globals.css";
import { Providers } from "@/components/providers";
import { AuraBackground } from "@/components/aura-background";

export const metadata = {
  title: "Capacity Connect",
  description: "Smart Education LMS — MoES / IMD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#100e0b] min-h-screen text-slate-100 antialiased">
        <AuraBackground isFixed={true} />
        <div className="relative z-10 min-h-screen">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

