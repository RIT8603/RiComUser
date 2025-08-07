
"use client";

import { useState, useRef } from 'react';
import { Loader2, ImagePlus, X, Send } from 'lucide-react';
import { textImageTranslation, TextImageTranslationOutput } from '@/ai/flows/text-image-translation-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface TextImageTranslatorProps {
    sourceLanguage: string;
    targetLanguage: string;
    onTranslation: (result: TextImageTranslationOutput) => void;
    instance: string;
}

export function TextImageTranslator({ sourceLanguage, targetLanguage, onTranslation, instance }: TextImageTranslatorProps) {
    const [text, setText] = useState('');
    const [image, setImage] = useState<{file: File, dataUri: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage({file, dataUri: e.target?.result as string});
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTranslate = async () => {
        if (!text.trim() && !image) {
            toast({
                variant: "destructive",
                title: "Input Required",
                description: "Please provide text or an image to translate.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await textImageTranslation({
                sourceLanguage,
                targetLanguage,
                text,
                imageDataUri: image?.dataUri,
            });
            onTranslation(result);
        } catch (e: any) {
            console.error("Translation failed:", e);
            toast({
                variant: "destructive",
                title: "Translation Failed",
                description: e.message || "An error occurred during translation.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
            <div className="w-full space-y-2">
                <Textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="w-full"
                    rows={4}
                    disabled={isLoading}
                />
                {image && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden border">
                        <Image src={image.dataUri} alt="Upload preview" layout="fill" objectFit="cover" />
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => setImage(null)}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex w-full justify-between items-center">
                <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {image ? 'Change Image' : 'Add Image'}
                </Button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                />
                <Button 
                    onClick={handleTranslate}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Translate
                </Button>
            </div>
        </div>
    );
}

