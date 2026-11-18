import "./globals.css";
import NavigationLoadingIndicator from "@/components/navigation/NavigationLoadingIndicator";

export const metadata = {
  title: "OMSONS | Life Science & Liquid Handling",
  description:
    "OMSONS laboratory instruments, liquid handling systems, life science consumables, and scientific services.",
  icons: {
    icon: "/omsons-germany-logo.png",
    apple: "/omsons-germany-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
        <NavigationLoadingIndicator />
      </body>
    </html>
  );
}
