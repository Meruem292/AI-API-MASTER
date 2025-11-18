'use server';

import { analyzeApiResponseForPotentialIssues } from '@/ai/flows/analyze-api-response-for-potential-issues';
import { analyzePhotoForObjects as analyzePhoto, type AnalyzePhotoForObjectsOutput } from '@/ai/flows/analyze-photo-for-objects';

interface RequestPayload {
  method: string;
  url: string;
  headers: { key: string; value: string }[];
  body: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: number;
}

export interface AnalysisResult {
  issues: string[];
}

export interface ActionResponse {
  response?: ApiResponse;
  analysis?: AnalysisResult;
  error?: string;
}

function headersToObject(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

async function urlToDataUri(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const contentType = blob.type;
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
}


export async function analyzePhotoForObjects(imageUrl: string): Promise<AnalyzePhotoForObjectsOutput> {
  const dataUri = await urlToDataUri(imageUrl);
  return analyzePhoto({ photoDataUri: dataUri });
}

export async function sendRequest(
  payload: RequestPayload
): Promise<ActionResponse> {
  const { method, url, headers: customHeaders, body } = payload;
  
  if (!url) {
    return { error: 'URL is required.' };
  }

  const headers = new Headers();
  customHeaders.forEach(header => {
    if (header.key && header.value) {
      headers.append(header.key, header.value);
    }
  });

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: (method !== 'GET' && method !== 'HEAD' && body) ? body : undefined,
    });
    const endTime = Date.now();

    const responseBodyText = await response.text();
    const responseHeaders = headersToObject(response.headers);
    let responseBody: any = responseBodyText;
    
    try {
      responseBody = JSON.parse(responseBodyText);
    } catch (e) {
      // Not a JSON response, keep as text
    }

    const apiResponse: ApiResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: endTime - startTime,
    };
    
    try {
      const analysis = await analyzeApiResponseForPotentialIssues({
        statusCode: apiResponse.status,
        headers: apiResponse.headers,
        body: typeof apiResponse.body === 'string' ? apiResponse.body : JSON.stringify(apiResponse.body, null, 2),
      });

      return {
        response: apiResponse,
        analysis: analysis
      };

    } catch (analysisError) {
      console.error("AI analysis failed:", analysisError);
      return {
        response: apiResponse,
        error: `Request successful, but AI analysis failed: ${analysisError instanceof Error ? analysisError.message : String(analysisError)}`,
      };
    }

  } catch (error) {
    console.error("Fetch error:", error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred during fetch.' };
  }
}
