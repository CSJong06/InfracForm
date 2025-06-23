import { Inter } from 'next/font/google'; // Import Inter font from Google Fonts
import './globals.css'; // Import global CSS styles
import Providers from './providers'; // Import React Query provider component

const inter = Inter({ subsets: ['latin'] }); // Initialize Inter font with Latin subset

export const metadata = { // Export metadata for SEO and page information
  title: 'Infraction Form', // Set the page title
  description: 'Infraction Form Application', // Set the page description
};

export default function RootLayout({ children }) { // Root layout component that wraps all pages
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers> 
          {children}
        </Providers>
      </body>
    </html>
  );
}
