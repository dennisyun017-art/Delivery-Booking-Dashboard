import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "납품 시간 예약",
  description: "Assembly BP사 · 납품 BP사 납품 시간 조율 대시보드",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
