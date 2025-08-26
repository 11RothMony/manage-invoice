import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import InstallButton from '@/components/ui/InstallPWA';


const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <Component {...pageProps} />
      <InstallButton/>
      <Toaster />
    </div>
  );
}