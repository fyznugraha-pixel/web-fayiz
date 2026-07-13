import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Registrasi - Bongkar Rahasia Cuan Lewat TikTok Social Commerce',
  description: 'Form pendaftaran acara Bongkar Rahasia Cuan Lewat TikTok Social Commerce bersama Tim TikTok Official Indonesia',
  icons: {
    icon: '/logo/iwapi.png',
    apple: '/logo/iwapi.png',
  },
}

import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
