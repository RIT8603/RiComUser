
"use client";

import { useState, useRef, useEffect } from 'react';
import { ArrowRightLeft, Volume2 } from 'lucide-react';
import { VoiceTranslationOutput } from '@/ai/flows/voice-translation-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { VoiceTranslator } from './voice-translator';

const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
];

const UserPanel = ({
  userLabel,
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  translatedText,
  translatedAudioUri,
  onTranslation,
}: {
  userLabel: string;
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguage: string;
  translatedText: string;
  translatedAudioUri: string | null;
  onTranslation: (result: VoiceTranslationOutput) => void;
}) => {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (translatedAudioUri && audioPlayerRef.current) {
        audioPlayerRef.current.src = translatedAudioUri;
        audioPlayerRef.current.play().catch(e => {
            console.error("Audio playback failed:", e)
            toast({
                variant: "destructive",
                title: "Playback Error",
                description: "Could not play the translated audio automatically.",
            });
        });
    }
  }, [translatedAudioUri, toast]);

  const playAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }

  return (
    <div className="flex-1 p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold text-lg">{userLabel}</h3>
      <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
        <SelectTrigger>
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <VoiceTranslator 
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        onTranslation={onTranslation}
        instance={userLabel}
      />
      {translatedText && (
        <div className="text-center p-3 bg-muted rounded-lg w-full">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-left">Translated Text:</p>
              <Button onClick={playAudio} variant="ghost" size="icon" disabled={!translatedAudioUri}>
                  <Volume2 className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-left">{translatedText}</p>
        </div>
      )}
      <audio ref={audioPlayerRef} className="hidden" />
    </div>
  );
};


export function CallInterface() {
    const [user1Lang, setUser1Lang] = useState('english');
    const [user2Lang, setUser2Lang] = useState('hindi');

    const [user1Translation, setUser1Translation] = useState<VoiceTranslationOutput | null>(null);
    const [user2Translation, setUser2Translation] = useState<VoiceTranslationOutput | null>(null);

    const handleUser1Translation = (result: VoiceTranslationOutput) => {
        setUser2Translation(result); // User 1 speaks, User 2 hears translation
    };

    const handleUser2Translation = (result: VoiceTranslationOutput) => {
        setUser1Translation(result); // User 2 speaks, User 1 hears translation
    };

    const swapLanguages = () => {
        const tempLang = user1Lang;
        setUser1Lang(user2Lang);
        setUser2Lang(tempLang);
        setUser1Translation(null);
        setUser2Translation(null);
    };

    return (
        <Card className="w-full max-w-4xl shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-4xl font-headline font-bold text-primary">LinguaLive</CardTitle>
                <CardDescription className="text-lg">Real-time Bilingual Voice Call</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start justify-center gap-4 md:gap-8 flex-col md:flex-row">
                    <UserPanel 
                      userLabel="User 1"
                      sourceLanguage={user1Lang}
                      setSourceLanguage={setUser1Lang}
                      targetLanguage={user2Lang}
                      translatedText={user1Translation?.translatedText || ''}
                      translatedAudioUri={user1Translation?.translatedAudioUri || null}
                      onTranslation={handleUser2Translation}
                    />

                    <div className="flex items-center justify-center pt-20">
                      <Button variant="ghost" size="icon" onClick={swapLanguages} aria-label="Swap languages">
                          <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                      </Button>
                    </div>

                    <UserPanel 
                      userLabel="User 2"
                      sourceLanguage={user2Lang}
                      setSourceLanguage={setUser2Lang}
                      targetLanguage={user1Lang}
                      translatedText={user2Translation?.translatedText || ''}
                      translatedAudioUri={user2Translation?.translatedAudioUri || null}
                      onTranslation={handleUser1Translation}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
