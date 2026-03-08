import type { Metadata, Viewport } from "next";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DatePickerProvider from '@/components/DatePickerProvider';
import theme from '@/lib/theme';
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Track your monthly expenses and bills",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <DatePickerProvider>
            <CssBaseline />
            {children}
          </DatePickerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
