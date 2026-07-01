import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import { AuthProvider } from "@/context/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CampusConnect — Connect with Real College Students",
    template: "%s | CampusConnect",
  },
  description:
    "India's student-to-student college guidance platform. Get genuine admission guidance, scholarship advice, placement insights, and campus experiences from verified students.",
  keywords: [
    "college guidance",
    "student ambassadors",
    "admissions",
    "scholarships",
    "placements",
    "India colleges",
  ],
  openGraph: {
    title: "CampusConnect — Connect with Real College Students",
    description:
      "Get authentic college guidance from verified students before you choose your college.",
    url: siteUrl,
    siteName: "CampusConnect",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
