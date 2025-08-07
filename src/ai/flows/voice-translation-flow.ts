
'use server';

/**
 * @fileOverview This file defines a Genkit flow for real-time voice translation.
 *
 * It incorporates speech-to-text, translation, and text-to-speech functionalities.
 *
 * - voiceTranslation - A function that handles the voice translation process.
 * - VoiceTranslationInput - The input type for the voiceTranslation function.
 * - VoiceTranslationOutput - The return type for the voiceTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceTranslationInputSchema = z.object({
  sourceLanguage: z.string().describe('The source language of the speaker.'),
  targetLanguage: z.string().describe('The target language for translation.'),
  audioDataUri: z
    .string()
    .describe(
      "The audio data URI containing the speaker's voice, which must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VoiceTranslationInput = z.infer<typeof VoiceTranslationInputSchema>;

const VoiceTranslationOutputSchema = z.object({
  translatedAudioUri: z.string().describe('The translated audio data URI.'),
  translatedText: z.string().describe('The translated text.'),
});
export type VoiceTranslationOutput = z.infer<typeof VoiceTranslationOutputSchema>;

export async function voiceTranslation(input: VoiceTranslationInput): Promise<VoiceTranslationOutput> {
  return voiceTranslationFlow(input);
}

const TranslationResponseSchema = z.object({
  translatedText: z.string().describe('The translated text.')
});

const voiceTranslationPrompt = ai.definePrompt({
  name: 'voiceTranslationPrompt',
  model: 'googleai/gemini-1.5-flash-preview',
  input: {schema: z.object({
    sourceLanguage: VoiceTranslationInputSchema.shape.sourceLanguage,
    targetLanguage: VoiceTranslationInputSchema.shape.targetLanguage,
    audioDataUri: VoiceTranslationInputSchema.shape.audioDataUri,
  })},
  output: {schema: TranslationResponseSchema},
  prompt: `You are a real-time voice translator. A user will provide audio in {{{sourceLanguage}}} which you will translate to {{{targetLanguage}}}.

  The audio input is provided in the following data URI:
  {{media url=audioDataUri}}

  First, transcribe the audio to text. Then, translate the transcribed text from {{{sourceLanguage}}} to {{{targetLanguage}}}.

  You MUST return the output in the exact JSON format specified in the output schema.
  Your entire response must be a single JSON object. Do not include any other text or explanation.
  Example of the exact output format required:
  {
    "translatedText": "This is the translated text."
  }
  `,
});

const voiceTranslationFlow = ai.defineFlow(
  {
    name: 'voiceTranslationFlow',
    inputSchema: VoiceTranslationInputSchema,
    outputSchema: VoiceTranslationOutputSchema,
  },
  async (input) => {
    const promptResult = await voiceTranslationPrompt(input);
    
    const output = promptResult.output;
    if (!output || !output.translatedText) {
      throw new Error('Translation failed: no text returned from AI.');
    }
    
    const translatedAudioUri = await textToSpeech(output.translatedText);

    return {
      translatedAudioUri,
      translatedText: output.translatedText,
    };
  }
);

async function textToSpeech(text: string): Promise<string> {
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.5-flash-preview-tts',
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Algenib' },
        },
      },
    },
    prompt: text,
  });
  if (!media) {
    throw new Error('no media returned');
  }
  const audioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );
  return 'data:audio/wav;base64,' + (await toWav(audioBuffer));
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
