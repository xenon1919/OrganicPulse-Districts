import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterSW } from "@/components/register-sw";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Fraunces for the hero headline and big stat numbers only - a soft, warm
// serif with genuine organic character (its WONK/opsz axes were built for
// exactly this: material, grown, unhurried - not another geometric grotesk).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "WONK"],
});

// IBM Plex Sans for body copy - a technical-but-warm workhorse designed
// alongside Plex Mono, so the two read as one deliberate system rather than
// two unrelated typefaces glued together.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// IBM Plex Mono for the app's actual data - pass codes, hub names, batch
// weights, the AI model credit line - earned here because the product
// really is a ledger of tracked material, not decoration.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "OrganicPulse Districts",
  description:
    "A circular economy marketplace connecting households, local organic manure manufacturers, and terrace gardeners for zero-waste dry resource recovery.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OrganicPulse",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4EFE1" },
    { media: "(prefers-color-scheme: dark)", color: "#2B2821" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-center" theme="system" />
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}
