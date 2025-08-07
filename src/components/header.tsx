import Link from 'next/link';
import { MessageSquareCode } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <MessageSquareCode className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">RIComUser</span>
          </Link>
          <nav>
            <Link href="/login" passHref>
              <Button variant="ghost">Admin Login</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
