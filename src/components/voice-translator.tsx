"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Loader2, Mic, Square } from 'lucide-react';
import { voiceTranslation, VoiceTranslationOutput } from '@/ai/flows/voice-translation-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
];

export function VoiceTranslator() {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sourceLanguage, setSourceLanguage] = useState('english');
    const [targetLanguage, setTargetLanguage] = useState('hindi');
    const [translationResult, setTranslationResult] = useState<VoiceTranslationOutput | null>(null);
    const [translatedText, setTranslatedText] = useState('');
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement>(null);

    const { toast } = useToast();

    const handleStartRecording = async () => {
        setTranslationResult(null);
        setTranslatedText('');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };
                mediaRecorderRef.current.onstop = () => {
                    setIsRecording(false);
                    setIsLoading(true);

                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64Audio = reader.result as string;
                        try {
                            const result = await voiceTranslation({
                                sourceLanguage,
                                targetLanguage,
                                audioDataUri: base64Audio,
                            });
                            setTranslationResult(result);
                            setTranslatedText(result.translatedText);
                        } catch (e: any) {
                            console.error("Translation failed:", e);
                            toast({
                                variant: "destructive",
                                title: "Translation Failed",
                                description: e.message || "An error occurred during translation. Please try again.",
                            });
                        } finally {
                            setIsLoading(false);
                        }
                    };
                };
                audioChunksRef.current = [];
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                toast({
                    variant: "destructive",
                    title: "Microphone Error",
                    description: "Microphone access denied. Please allow microphone access in your browser settings.",
                });
            }
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            handleStopRecording();
        } else {
            handleStartRecording();
        }
    };

    const swapLanguages = () => {
        setSourceLanguage(targetLanguage);
        setTargetLanguage(sourceLanguage);
    };

    useEffect(() => {
        if (translationResult?.translatedAudioUri && audioPlayerRef.current) {
            audioPlayerRef.current.src = translationResult.translatedAudioUri;
            audioPlayerRef.current.play().catch(e => {
                console.error("Audio playback failed:", e)
                toast({
                    variant: "destructive",
                    title: "Playback Error",
                    description: "Could not play the translated audio automatically.",
                });
            });
        }
    }, [translationResult, toast]);

    const getStatusText = () => {
        if (isRecording) return "Recording your voice...";
        if (isLoading) return "Translating...";
        if (translationResult) return "Translation complete. Playing audio...";
        return "Select languages and start speaking";
    }

    return (
        <Card className="w-full max-w-md shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-4xl font-headline font-bold text-primary">LinguaLive</CardTitle>
                <CardDescription className="text-lg">Your real-time voice translator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                        <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="From" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="ghost" size="icon" onClick={swapLanguages} aria-label="Swap languages">
                        <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="flex-1">
                        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="To" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                    <motion.div
                        animate={{ scale: isRecording ? 1.1 : 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 10, repeat: isRecording ? Infinity : 0, repeatType: 'reverse' }}
                    >
                        <Button
                            onClick={toggleRecording}
                            disabled={isLoading}
                            className="h-24 w-24 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div key="loader" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                        <Loader2 className="h-10 w-10 animate-spin" />
                                    </motion.div>
                                ) : isRecording ? (
                                    <motion.div key="stop" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                        <Square className="h-10 w-10 fill-white" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="mic" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                        <Mic className="h-10 w-10" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </motion.div>
                    <p className="text-muted-foreground h-5">{getStatusText()}</p>
                    {translatedText && (
                        <div className="text-center p-4 bg-muted rounded-lg w-full">
                            <p className="font-semibold">Translated Text:</p>
                            <p>{translatedText}</p>
                        </div>
                    )}
                </div>
                <audio ref={audioPlayerRef} className="hidden" />
            </CardContent>
        </Card>
    );
}
