import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "PULSE — CS2 Telegram Radar",
  description: "Telegram-бот для важных обновлений, багов, новостей и турниров Counter-Strike 2.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
