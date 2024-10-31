import "./globals.scss";

import type { Metadata, Viewport } from "next";

import { BackendENV } from "@repo/env";
import TRPCLayout from "./layout.trpc";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "NextJS + TRPC",
  description: "A turborepo example with NextJS and TRPC",
};

async function getBackendURL() {
  "use server";
  return BackendENV.BACKEND_URL;
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string; session: any };
}>) {
  const backendURL = await getBackendURL();

  return (
    <html lang={locale} data-backend-url={backendURL}>
      <body>
        <TRPCLayout>
          <div className="w-full h-full md:p-2 lg:p-4 flex justify-center items-center relative overflow-x-hidden">
            {children}
          </div>
        </TRPCLayout>
      </body>
    </html>
  );
}
