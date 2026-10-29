import type { Metadata, Viewport } from "next";
import { Archivo, Inter, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterSW } from "@/components/register-sw";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Archivo for display - a confident, blocky grotesk with a true black
// weight and a condensed width axis, for the premium-dark/bold-accent
// fintech look (CRED) this product is now modeled on.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

// Inter for body copy - clean and neutral, lets the display weight and the
// accent color carry the personality instead of the body text.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// IBM Plex Mono for small data tags - pass codes, hub names, the AI model
// credit line.
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
    { media: "(prefers-color-scheme: light)", color: "#F1F1EC" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0D0B" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
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
