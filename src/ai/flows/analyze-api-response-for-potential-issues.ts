'use server';
/**
 * @fileOverview Analyzes an API response for potential issues using an LLM.
 *
 * - analyzeApiResponseForPotentialIssues - Analyzes the API response and surfaces any potential issues.
 * - AnalyzeApiResponseForPotentialIssuesInput - The input type for the analyzeApiResponseForPotentialIssues function.
 * - AnalyzeApiResponseForPotentialIssuesOutput - The return type for the analyzeApiResponseForPotentialIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeApiResponseForPotentialIssuesInputSchema = z.object({
  headers: z.record(z.string()).describe('The headers of the API response.'),
  statusCode: z.number().describe('The HTTP status code of the API response.'),
  body: z.string().describe('The body of the API response.'),
});
export type AnalyzeApiResponseForPotentialIssuesInput = z.infer<
  typeof AnalyzeApiResponseForPotentialIssuesInputSchema
>;

const AnalyzeApiResponseForPotentialIssuesOutputSchema = z.object({
  issues: z.array(
    z.string().describe('A list of potential issues identified in the API response.')
  ).
  describe('A list of potential issues identified in the API response.'),
});
export type AnalyzeApiResponseForPotentialIssuesOutput = z.infer<
  typeof AnalyzeApiResponseForPotentialIssuesOutputSchema
>;

export async function analyzeApiResponseForPotentialIssues(
  input: AnalyzeApiResponseForPotentialIssuesInput
): Promise<AnalyzeApiResponseForPotentialIssuesOutput> {
  return analyzeApiResponseForPotentialIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeApiResponseForPotentialIssuesPrompt',
  input: {schema: AnalyzeApiResponseForPotentialIssuesInputSchema},
  output: {schema: AnalyzeApiResponseForPotentialIssuesOutputSchema},
  prompt: `You are an expert API analyst. Analyze the following API response and identify any potential issues, errors, or areas of concern. Provide a list of issues found.

Headers:
{{#each headers}}  {{@key}}: {{this}}
{{/each}}

Status Code: {{{statusCode}}}

Body:
{{{body}}}`,
});

const analyzeApiResponseForPotentialIssuesFlow = ai.defineFlow(
  {
    name: 'analyzeApiResponseForPotentialIssuesFlow',
    inputSchema: AnalyzeApiResponseForPotentialIssuesInputSchema,
    outputSchema: AnalyzeApiResponseForPotentialIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
