'use server';
/**
 * @fileOverview Analyzes a photo for specific objects.
 *
 * - analyzePhotoForObjects - A function that handles the photo analysis process.
 * - AnalyzePhotoForObjectsInput - The input type for the analyzePhotoForObjects function.
 * - AnalyzePhotoForObjectsOutput - The return type for the analyzePhotoForObjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePhotoForObjectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePhotoForObjectsInput = z.infer<typeof AnalyzePhotoForObjectsInputSchema>;

const AnalyzePhotoForObjectsOutputSchema = z.object({
  trash: z.boolean().describe('Whether or not any trash is visible in the photo.'),
  plasticBottle: z.boolean().describe('Whether or not at least one plastic bottle is visible in the photo.'),
  plasticBottleCount: z.number().describe('The number of plastic bottles visible in the photo.').default(0),
});
export type AnalyzePhotoForObjectsOutput = z.infer<typeof AnalyzePhotoForObjectsOutputSchema>;

export async function analyzePhotoForObjects(input: AnalyzePhotoForObjectsInput): Promise<AnalyzePhotoForObjectsOutput> {
  return analyzePhotoForObjectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePhotoForObjectsPrompt',
  input: {schema: AnalyzePhotoForObjectsInputSchema},
  output: {schema: AnalyzePhotoForObjectsOutputSchema},
  prompt: `You are an image analysis expert. Analyze the provided photo.

Determine if there is any trash visible in the photo.
Determine if there is at least one plastic bottle visible in the photo.
Count the number of plastic bottles visible in the photo.

Return the results in the specified JSON format.

Photo: {{media url=photoDataUri}}`,
});

const analyzePhotoForObjectsFlow = ai.defineFlow(
  {
    name: 'analyzePhotoForObjectsFlow',
    inputSchema: AnalyzePhotoForObjectsInputSchema,
    outputSchema: AnalyzePhotoForObjectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
