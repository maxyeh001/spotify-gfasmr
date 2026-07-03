import { Sidebar } from '@/components/Sidebar';
import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { Figtree } from 'next/font/google';
import Script from 'next/script';

import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { UserProvider } from '@/providers/UserProvider';
import { ModalProvider } from '@/providers/ModalProvider';
import { ToasterProvider } from '@/providers/ToasterProvider';

import { getSongsByUserId } from '@/actions/getSongsByUserId';
import { Player } from '@/components/Player';
import { getActiveProductsWithPrices } from '@/actions/getActiveProductsWithPrices';

const font = Figtree({ subsets: ['latin'] });

//* Describe the web app
export const metadata = {
  title: 'Boyfriend ASMR',
  description: 'Listen to your favorite ASMRtists!',
};

export const revalidate = 0;

//* Main layout component for the app
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userSongs = await getSongsByUserId();
  const products = await getActiveProductsWithPrices();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png" />

        {/* Hotjar / Contentsquare */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            src="https://t.contentsquare.net/uxa/ecc32f9395340.js"
            strategy="afterInteractive"
          />
        )}

        {/* Google Analytics */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-MVD90BGG1C"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-MVD90BGG1C');
              `}
            </Script>
          </>
      )}
      </head>

      <body className={font.className}>
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider products={products} />
            <Sidebar songs={userSongs}>{children}</Sidebar>
            <Player />
          </UserProvider>
        </SupabaseProvider>

        <Analytics />
      </body>
    </html>
  );
}
