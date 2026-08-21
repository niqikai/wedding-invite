import type { Metadata, Viewport } from "next";
import { wedding } from "@/config/wedding";
import "./globals.css";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = { metadataBase: new URL(siteUrl), title: wedding.shareTitle, description: wedding.shareDescription, alternates: { canonical: "/" }, openGraph: { title: wedding.shareTitle, description: wedding.shareDescription, url: siteUrl, images: [wedding.shareImage], type: "website" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f3f1ec" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
