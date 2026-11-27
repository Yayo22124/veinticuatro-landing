import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import { getRequestLocale, getServerIntl } from "@/i18n/server";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const intl = await getServerIntl();

  return {
    title: intl.formatMessage({ id: "app.title" }),
    description: intl.formatMessage({ id: "app.description" }),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} className={inter.variable}>
      <body>
        <ThemeRegistry>
          <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
