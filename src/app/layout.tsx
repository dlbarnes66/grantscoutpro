import { ClerkProvider } from "@clerk/nextjs";
import GlobalHomeButton from "@/components/GlobalHomeButton";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <GlobalHomeButton />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
