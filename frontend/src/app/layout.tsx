import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Shofy - Multipurpose eCommerce website",
  description: "Next-generation fullstack eCommerce marketplace & dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-white text-slate-900 min-h-screen">
        <Layout>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#0f172a",
                color: "#ffffff",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "500",
              },
            }}
          />
        </Layout>
      </body>
    </html>
  );
}
