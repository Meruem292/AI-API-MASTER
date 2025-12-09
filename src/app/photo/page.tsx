"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzePhotoForObjects } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Image as ImageIcon, Package } from 'lucide-react';


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = 'polyBitePhoto';

interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

interface AnalysisResult {
  trash: boolean;
  plasticBottle: boolean;
  plasticBottleCount: number;
}

export default function PhotoPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    async function fetchAndAnalyzePhoto() {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setError("Supabase environment variables are not set.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET_NAME}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "prefix": "",
            "limit": 100,
            "offset": 0,
            "sortBy": {
              "column": "updated_at",
              "order": "desc"
            }
          })
        });

        if (!response.ok) {
           const errorBody = await response.text();
           console.error("Error response from Supabase:", errorBody);
           throw new Error(`Failed to fetch photos: ${response.statusText}`);
        }

        const files: FileObject[] = await response.json();
        let mostRecentFile: FileObject | undefined;
        if (files && files.length > 0) {
            mostRecentFile = files.find(file => file.name !== '.emptyFolderPlaceholder');
        }

        if (mostRecentFile) {
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${mostRecentFile.name}`;
          setImageUrl(publicUrl);
          setLoading(false);

          setAnalyzing(true);
          try {
            const analysisResult = await analyzePhotoForObjects(publicUrl);
            setAnalysis(analysisResult);
          } catch (analysisError) {
            console.error("AI analysis failed:", analysisError);
            setError("AI analysis failed. Please try again.");
          } finally {
            setAnalyzing(false);
          }
        } else {
          setError("No photos found in the bucket.");
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setLoading(false);
      }
    }

    fetchAndAnalyzePhoto();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground font-body p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold mb-2">Most Recent Photo</h1>
          <p className="text-muted-foreground">Displaying the latest image from the collection with AI analysis.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="text-muted-foreground"/>
              <span>Image Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
              {loading && (
                <Skeleton className="h-full w-full" />
              )}
              {error && !loading && !imageUrl && (
                 <p className="text-destructive">{error}</p>
              )}
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Most Recent Photo"
                  fill
                  className="object-contain"
                  unoptimized // Required for external images that are not configured in next.config.js
                />
              )}
               {!loading && !error && !imageUrl && (
                <p className="text-muted-foreground">No photo to display.</p>
               )}
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-muted-foreground"/>
              <span>AI Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyzing && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
              </div>
            )}
            {error && !analyzing && (
              <Alert variant="destructive">
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {analysis && !analyzing && (
              <div className="space-y-4">
                 <Alert>
                  <AlertTitle>Analysis Complete</AlertTitle>
                  <AlertDescription>The AI has finished analyzing the photo.</AlertDescription>
                </Alert>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col rounded-lg border p-4">
                    <dt className="font-semibold text-muted-foreground">Trash Visible</dt>
                    <dd className="text-2xl font-bold">{analysis.trash ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="flex flex-col rounded-lg border p-4">
                    <dt className="font-semibold text-muted-foreground">Plastic Bottle Visible</dt>
                    <dd className="text-2xl font-bold">{analysis.plasticBottle ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="flex flex-col rounded-lg border p-4">
                    <dt className="font-semibold text-muted-foreground">Plastic Bottle Count</dt>
                    <dd className="text-2xl font-bold">{analysis.plasticBottleCount}</dd>
                  </div>
                </dl>
              </div>
            )}
            {!analysis && !analyzing && !error && (
              <p className="text-muted-foreground p-4 text-center">Waiting for image to perform analysis...</p>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
