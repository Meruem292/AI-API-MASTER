import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

let keyIndex = 0;
const getApiKey = (): string | undefined => {
  const keys = (process.env.GEMINI_API_KEY || "key1,key2").split(',');
  const key = keys[keyIndex];
  keyIndex = (keyIndex + 1) % keys.length;
  return key;
};

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: getApiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash-lite',
});
