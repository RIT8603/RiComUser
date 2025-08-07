
"use client";

import { useEffect, useState } from 'react';
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { UserProvider } from '@/context/user-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RegistrationForm } from '@/components/registration-form';

// Since we are using client-side logic, we can't export Metadata directly.
// export const metadata: Metadata = {
//   title: 'RIComUser',
//   description: 'Real-Time Bilingual Voice Communication Tool',
// };

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    // This logic runs only on the client
    document.title = 'RIComUser: Real-Time Bilingual Voice Communication Tool';
    const hasRegistered = localStorage.getItem('hasRegistered') === 'true';
    if (!hasRegistered) {
      setShowRegistration(true);
    }
  }, []);

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <UserProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome to RIComUser!</DialogTitle>
                    <DialogDescription>
                        Please register to continue. It only takes a moment.
                    </DialogDescription>
                </DialogHeader>
                <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
            </DialogContent>
          </Dialog>
        </UserProvider>
      </body>
    </html>
  );
}

export default AppLayout;
