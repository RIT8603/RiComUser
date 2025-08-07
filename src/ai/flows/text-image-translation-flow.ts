
'use server';

/**
 * @fileOverview This file defines a Genkit flow for text and image-based translation.
 *
 * It translates text from a source language to a target language, optionally using an
 * image as additional context.
 *
 * - textImageTranslation - A function that handles the text/image translation process.
 * - TextImageTranslationInput - The input type for the textImageTranslation function.
 * - TextImageTranslationOutput - The return type for the textImageTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextImageTranslationInputSchema = z.object({
  sourceLanguage: z.string().describe('The source language of the text.'),
  targetLanguage: z.string().describe('The target language for translation.'),
  text: z.string().describe('The text to be translated.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An optional image data URI to provide context for the translation. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type TextImageTranslationInput = z.infer<typeof TextImageTranslationInputSchema>;

const TextImageTranslationOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TextImageTranslationOutput = z.infer<typeof TextImageTranslationOutputSchema>;

export async function textImageTranslation(input: TextImageTranslationInput): Promise<TextImageTranslationOutput> {
  return textImageTranslationFlow(input);
}

const textImageTranslationPrompt = ai.definePrompt({
  name: 'textImageTranslationPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: TextImageTranslationInputSchema},
  output: {schema: TextImageTranslationOutputSchema},
  prompt: `You are an expert translator. Your task is to translate the given text from {{{sourceLanguage}}} to {{{targetLanguage}}}.
  {{#if imageDataUri}}
  An image has been provided as context. Use the visual information from the image to improve the accuracy and context of the translation.
  Image: {{media url=imageDataUri}}
  {{/if}}

  Text to translate: "{{{text}}}"

  You MUST return the output in the exact JSON format specified in the output schema.
  Your entire response must be a single JSON object. Do not include any other text or explanation.
  Example of the exact output format required:
  {
    "translatedText": "This is the translated text."
  }
  `,
});


const textImageTranslationFlow = ai.defineFlow(
  {
    name: 'textImageTranslationFlow',
    inputSchema: TextImageTranslationInputSchema,
    outputSchema: TextImageTranslationOutputSchema,
  },
  async (input) => {
    if (!input.text.trim()) {
        return { translatedText: '' };
    }
    const promptResult = await textImageTranslationPrompt(input);
    const output = promptResult.output;

    if (!output) {
      throw new Error('Translation failed: no output from AI.');
    }
    
    return {
      translatedText: output.translatedText,
    };
  }
);
