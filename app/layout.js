import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "Capacity Connect",
  description: "Smart Education LMS — MoES / IMD",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-background min-h-screen text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


