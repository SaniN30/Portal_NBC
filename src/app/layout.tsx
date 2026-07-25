import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

const inter = Inter({ variable: "--font-sans-app", subsets: ["latin"] });
const sourceSerif = Source_Serif_4({
  variable: "--font-display-app",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Neev Bridge Consultancy — Engineering Careers",
  description: "Engineering job portal by Neev Bridge Consultancy Manpower. Browse live roles, upload your CV, and apply in minutes.",
};

// Set the theme before first paint to avoid a flash. Resolves saved choice, else system.
const themeScript = `
(function(){try{
  var t=localStorage.getItem("theme");
  if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
  document.documentElement.setAttribute("data-theme",t);
}catch(e){}})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col pt-20 sm:pt-24">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
