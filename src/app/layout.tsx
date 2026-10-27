import type { Metadata, Viewport } from "next";
import { Geist_Mono, Nunito, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterSW } from "@/components/register-sw";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Nunito for headings/numbers - the chunky, rounded, extra-bold weight behind
// the Swiggy/Zomato look (big prices, ratings, headers).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

// DM Sans for body copy - clean and geometric, keeps long text readable
// next to the heavier display weights.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    { media: "(prefers-color-scheme: light)", color: "#FAFBF8" },
    { media: "(prefers-color-scheme: dark)", color: "#282b2e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistMono.variable} ${nunito.variable} ${dmSans.variable} h-full antialiased`}
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
