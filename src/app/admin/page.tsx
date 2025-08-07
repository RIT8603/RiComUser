"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import { UserTable } from '@/components/user-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { isAdmin, logoutAdmin, users } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null; 
  }

  const handleLogout = () => {
    logoutAdmin();
    router.push('/');
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>View registered user data.</CardDescription>
            </div>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
