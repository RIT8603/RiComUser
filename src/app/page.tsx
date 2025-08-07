import { VoiceTranslator } from "@/components/voice-translator";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <VoiceTranslator />
    </main>
  );
}
