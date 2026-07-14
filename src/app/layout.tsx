// app/layout.tsx
'use client';

import { AuthClientProvider } from 'better-auth/react';
import { authClient } from '@/lib/auth-client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthClientProvider client={authClient}>
          {children}
        </AuthClientProvider>
      </body>
    </html>
  );
}