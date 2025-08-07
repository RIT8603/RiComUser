import { CallInterface } from "@/components/call-interface";
import { RegistrationForm } from "@/components/registration-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-6xl mx-auto py-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-primary tracking-tight">
              Welcome to RIComUser
            </h1>
            <p className="text-lg text-muted-foreground">
              Your seamless real-time bilingual communication tool. Break language barriers with instant voice and text translation. Start your conversation now.
            </p>
            <RegistrationForm />
          </div>
          <div className="hidden md:block">
            <CallInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
