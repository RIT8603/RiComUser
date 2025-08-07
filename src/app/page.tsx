import { CallInterface } from "@/components/call-interface";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-6xl mx-auto py-8">
            <CallInterface />
      </div>
    </div>
  );
}
