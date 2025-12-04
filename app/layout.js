// app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';

// Menggunakan font Inter standar Next.js
const inter = Inter({ subsets: ['latin'] });

// Metadata penting untuk SEO dan browser
export const metadata = {
  title: 'QRIS Converter API | By Ray',
  description: 'Public API untuk konversi QRIS Statis menjadi QRIS Dinamis dengan nominal.',
};

// Component layout utama yang membungkus semua halaman
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      {/* Set class font Inter ke body */}
      <body className={inter.className}>
        {/* children adalah konten dari page.js dan halaman lain */}
        {children}
      </body>
    </html>
  );
}
