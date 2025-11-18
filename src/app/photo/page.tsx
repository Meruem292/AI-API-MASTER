"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function PhotoPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMostRecentPhoto() {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setError("Supabase environment variables are not set.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET_NAME}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
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

        if (files && files.length > 0) {
          const mostRecentFile = files.find(file => file.name !== '.emptyFolderPlaceholder');
          
          if (mostRecentFile) {
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${mostRecentFile.name}`;
            setImageUrl(publicUrl);
          } else {
            setError("No photos found in the bucket.");
          }
        } else {
          setError("No files found in the bucket.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchMostRecentPhoto();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground font-body p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">Most Recent Photo</h1>
        <div className="relative aspect-video border rounded-lg flex items-center justify-center bg-muted">
          {loading && (
            <Skeleton className="h-full w-full" />
          )}
          {error && !loading && (
             <p className="text-destructive">{error}</p>
          )}
          {imageUrl && !loading && !error && (
            <Image
              src={imageUrl}
              alt="Most Recent Photo"
              fill
              className="object-contain"
            />
          )}
           {!loading && !error && !imageUrl && (
            <p className="text-muted-foreground">No photo to display.</p>
           )}
        </div>
      </div>
    </main>
  );
}
