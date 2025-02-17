import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { ToastProvider } from '@/components/ui/toast'
import { Header } from '@/components/Header'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BridgeSkills - Military to Civilian Career Transition',
  description: 'Transform your military experience into civilian career opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-full flex flex-col">
              <Header />
              <ErrorBoundary>
                <main className="flex-1">
                  {children}
                </main>
              </ErrorBoundary>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
