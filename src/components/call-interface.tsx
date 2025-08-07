
"use client";

import { useState, useRef, useEffect } from 'react';
import { ArrowRightLeft, Volume2 } from 'lucide-react';
import { VoiceTranslationOutput } from '@/ai/flows/voice-translation-flow';
import { TextImageTranslationOutput } from '@/ai/flows/text-image-translation-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { VoiceTranslator } from './voice-translator';
import { TextImageTranslator } from './text-image-translator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'kannada', label: 'Kannada' },
];

const UserPanel = ({
  userLabel,
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  voiceTranslationResult,
  textTranslationResult,
  onVoiceTranslation,
  onTextImageTranslation,
}: {
  userLabel: string;
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguage: string;
  voiceTranslationResult: VoiceTranslationOutput | null;
  textTranslationResult: TextImageTranslationOutput | null;
  onVoiceTranslation: (result: VoiceTranslationOutput) => void;
  onTextImageTranslation: (result: TextImageTranslationOutput) => void;
}) => {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const translatedText = textTranslationResult?.translatedText || voiceTranslationResult?.translatedText || '';
  const translatedAudioUri = voiceTranslationResult?.translatedAudioUri || null;


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
    if (audioPlayerRef.current && translatedAudioUri) {
      audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }

  return (
    <div className="flex-1 p-4 bg-card rounded-xl shadow-md space-y-4 border">
      <h3 className="font-semibold text-xl text-center text-primary">{userLabel}</h3>
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

      <Tabs defaultValue="voice">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="text-image">Text/Image</TabsTrigger>
        </TabsList>
        <TabsContent value="voice">
            <VoiceTranslator 
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                onTranslation={onVoiceTranslation}
                instance={userLabel}
            />
        </TabsContent>
        <TabsContent value="text-image">
            <TextImageTranslator
                 sourceLanguage={sourceLanguage}
                 targetLanguage={targetLanguage}
                 onTranslation={onTextImageTranslation}
                 instance={`${userLabel}-text`}
            />
        </TabsContent>
      </Tabs>

      {translatedText && (
        <div className="text-center p-3 bg-muted rounded-lg w-full min-h-[80px]">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-left text-foreground">Translation:</p>
              {translatedAudioUri && (
                <Button onClick={playAudio} variant="ghost" size="icon" disabled={!translatedAudioUri}>
                    <Volume2 className="h-5 w-5" />
                </Button>
              )}
            </div>
            <p className="text-sm text-left text-muted-foreground">{translatedText}</p>
        </div>
      )}
      <audio ref={audioPlayerRef} className="hidden" />
    </div>
  );
};


export function CallInterface() {
    const [user1Lang, setUser1Lang] = useState('english');
    const [user2Lang, setUser2Lang] = useState('hindi');

    const [user1VoiceTranslation, setUser1VoiceTranslation] = useState<VoiceTranslationOutput | null>(null);
    const [user2VoiceTranslation, setUser2VoiceTranslation] = useState<VoiceTranslationOutput | null>(null);

    const [user1TextTranslation, setUser1TextTranslation] = useState<TextImageTranslationOutput | null>(null);
    const [user2TextTranslation, setUser2TextTranslation] = useState<TextImageTranslationOutput | null>(null);

    const handleUser1VoiceTranslation = (result: VoiceTranslationOutput) => {
        setUser2VoiceTranslation(result);
        setUser2TextTranslation(null);
    };

    const handleUser2VoiceTranslation = (result: VoiceTranslationOutput) => {
        setUser1VoiceTranslation(result);
        setUser1TextTranslation(null);
    };

    const handleUser1TextImageTranslation = (result: TextImageTranslationOutput) => {
        setUser2TextTranslation(result);
        setUser2VoiceTranslation(null);
    };

    const handleUser2TextImageTranslation = (result: TextImageTranslationOutput) => {
        setUser1TextTranslation(result);
        setUser1VoiceTranslation(null);
    };


    const swapLanguages = () => {
        const tempLang = user1Lang;
        setUser1Lang(user2Lang);
        setUser2Lang(tempLang);
        setUser1VoiceTranslation(null);
        setUser2VoiceTranslation(null);
        setUser1TextTranslation(null);
        setUser2TextTranslation(null);
    };

    return (
        <Card className="w-full max-w-4xl shadow-2xl rounded-2xl bg-background border-none">
            <CardHeader className="text-center">
                <CardTitle className="text-4xl font-headline font-bold text-primary">RIComUser</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">Real-time Bilingual Communication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start justify-center gap-4 md:gap-8 flex-col md:flex-row">
                    <UserPanel 
                      userLabel="User 1"
                      sourceLanguage={user1Lang}
                      setSourceLanguage={setUser1Lang}
                      targetLanguage={user2Lang}
                      voiceTranslationResult={user1VoiceTranslation}
                      textTranslationResult={user1TextTranslation}
                      onVoiceTranslation={handleUser2VoiceTranslation}
                      onTextImageTranslation={handleUser2TextImageTranslation}
                    />

                    <div className="flex items-center justify-center pt-20">
                      <Button variant="ghost" size="icon" onClick={swapLanguages} aria-label="Swap languages" className="rounded-full bg-card hover:bg-muted">
                          <ArrowRightLeft className="h-6 w-6 text-primary" />
                      </Button>
                    </div>

                    <UserPanel 
                      userLabel="User 2"
                      sourceLanguage={user2Lang}
                      setSourceLanguage={setUser2Lang}
                      targetLanguage={user1Lang}
                      voiceTranslationResult={user2VoiceTranslation}
                      textTranslationResult={user2TextTranslation}
                      onVoiceTranslation={handleUser1VoiceTranslation}
                      onTextImageTranslation={handleUser1TextImageTranslation}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
