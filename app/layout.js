import { Inter } from 'next/font/google';
import './globals.css';
import { ReportsProvider } from '@/lib/hooks/useReports';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Infraction Form',
  description: 'Track and manage student infractions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReportsProvider>
          {children}
        </ReportsProvider>
      </body>
    </html>
  );
}
