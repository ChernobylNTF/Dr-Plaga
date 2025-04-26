import type { Metadata } from 'next'
// Importa tus estilos globales
import './globals.css'
// --- Importa el provider de MiniKit ---
import { MiniKitProvider } from '@worldcoin/minikit-react';

// Tu metadata (puedes cambiar 'v0 App' por 'Dr Plagua' si quieres)
export const metadata: Metadata = {
  title: 'Dr Plagua', // Actualizado
  description: 'Mini App Dr Plagua con World ID', // Actualizado
  generator: 'v0.dev', // Puedes quitar esto si quieres
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
        {/* --- Envuelve el body con MiniKitProvider --- */}
        <MiniKitProvider>
          <body>{children}</body>
        </MiniKitProvider>
    </html>
  )
}
