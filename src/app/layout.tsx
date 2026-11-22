import type { Metadata, Viewport } from "next"; // Added Viewport for iPhone/mobile scaling compatibility
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css"
import ReduxProvider from "@/redux/ReduxProvider";
import SessProvider from "@/lib/SessProvider";
import NextTopLoader from "nextjs-toploader"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RYDEX- Smart Vehicle Booking Platform",
  description: "Rydex is a modern smart mobility platform that connects passengers with reliable vehicle bookings in real time, featuring seamless reservations, transparent pricing, and instant fleet coordination.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
    >
      <body className={`min-h-dvh flex flex-col overflow-x-hidden ${poppins.className} antialiased`}> {/* Changed min-h-full to min-h-dvh & overflow-x-hidden for iOS Safari */}
        <NextTopLoader
          color="#000000"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        <SessProvider>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </SessProvider>
      </body>
    </html>
  );
}