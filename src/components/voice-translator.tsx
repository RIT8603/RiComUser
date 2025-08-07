"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mic, Square } from 'lucide-react';
import { voiceTranslation, VoiceTranslationOutput } from '@/ai/flows/voice-translation-flow';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceTranslatorProps {
    sourceLanguage: string;
    targetLanguage: string;
    onTranslation: (result: VoiceTranslationOutput) => void;
    instance: string;
}

export function VoiceTranslator({ sourceLanguage, targetLanguage, onTranslation, instance }: VoiceTranslatorProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const { toast } = useToast();

    const handleStartRecording = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const options = { mimeType: 'audio/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.warn(`${options.mimeType} is not supported. Falling back to default.`);
                    mediaRecorderRef.current = new MediaRecorder(stream);
                } else {
                    mediaRecorderRef.current = new MediaRecorder(stream, options);
                }
                
                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };
                mediaRecorderRef.current.onstop = () => {
                    setIsRecording(false);
                    setIsLoading(true);

                    const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
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
                            onTranslation(result);
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
            } catch (err: any) {
                console.error("Error accessing microphone:", err);
                toast({
                    variant: "destructive",
                    title: "Microphone Error",
                    description: err.message || "Microphone access denied. Please allow microphone access in your browser settings.",
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
    
    const getStatusText = () => {
        if (isRecording) return "Recording...";
        if (isLoading) return "Translating...";
        return "Tap to speak";
    }

    return (
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
            <p className="text-muted-foreground h-5 text-sm">{getStatusText()}</p>
        </div>
    );
}
