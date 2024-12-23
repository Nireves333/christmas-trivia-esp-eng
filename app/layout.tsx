import { Berkshire_Swash, Nunito } from "next/font/google";
import "./globals.css";

const berkshireSwash = Berkshire_Swash({
  variable: "--font-berkshire-swash",
  subsets: ["latin"],
  weight: "400",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: "700",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${berkshireSwash.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

