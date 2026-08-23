import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "Capacity Connect",
  description: "Smart Education LMS — MoES / IMD",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background min-h-screen text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

