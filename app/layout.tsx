import './globals.css'
import '../styles/themes.css'
import '../styles/fantasy-theme.css'
import type { Metadata } from 'next'
import ThemeProvider from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'
import AutoSaveProvider from '@/components/AutoSaveProvider'

export const metadata: Metadata = {
  title: 'D&D KI – Starter',
  description: 'Onboarding, OpenRouter, Zustand, Gameplay Loop',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="bg-primary text-primary min-h-screen">
        <ThemeProvider>
          <AutoSaveProvider>
            <ThemeToggle />
            {children}
          </AutoSaveProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}