import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة العروس الابتدائية | الجوانب الحضارية للدولتين السعوديتين",
  description: "منصة تعليمية تفاعلية لدرس الجوانب الحضارية للدولتين السعوديتين الأولى والثانية — الصف السادس الابتدائي، الدراسات الاجتماعية",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
