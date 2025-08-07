
"use client";

import { useState } from 'react';
import { useUserContext } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface RegistrationFormProps {
    onRegistrationSuccess?: () => void;
}

export function RegistrationForm({ onRegistrationSuccess }: RegistrationFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const { addUser } = useUserContext();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
        toast({ variant: 'destructive', title: "Validation Error", description: "Name and Email are required."});
        return;
    }
    addUser({ name, email, phone, school });
    toast({ title: "Registration Successful", description: "Thank you for registering!" });
    // Clear form
    setName('');
    setEmail('');
    setPhone('');
    setSchool('');

    if (onRegistrationSuccess) {
        onRegistrationSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="school">College/School</Label>
                <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} />
            </div>
        </div>
        <Button type="submit" className="w-full">Register</Button>
    </form>
  );
}
