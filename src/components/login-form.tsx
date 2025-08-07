"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginAdmin } = useUserContext();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(email, password)) {
      toast({ title: "Login Successful", description: "Redirecting to admin dashboard..." });
      router.push('/admin');
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid credentials." });
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>

                <div>
                <Button type="submit" className="w-full">
                    Sign in
                </Button>
                </div>
            </form>
        </CardContent>
    </Card>
  );
}
