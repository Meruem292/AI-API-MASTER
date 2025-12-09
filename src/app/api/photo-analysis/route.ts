import { NextResponse } from 'next/server';
import { analyzePhotoForObjects } from '@/app/actions';

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

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Supabase environment variables are not set." },
      { status: 500 }
    );
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
        "prefix": "",
        "limit": 100,
        "offset": 0,
        "sortBy": {
          "column": "updated_at",
          "order": "desc"
        }
      }),
      cache: 'no-store', // Ensure we always get the latest list
    });

    if (!response.ok) {
       const errorBody = await response.text();
       console.error("Error response from Supabase:", errorBody);
       return NextResponse.json(
        { error: `Failed to fetch photos: ${response.statusText}`, details: errorBody }, 
        { status: response.status }
       );
    }

    const files: FileObject[] = await response.json();
    let mostRecentFile: FileObject | undefined;
    if (files && files.length > 0) {
        // Find the most recent file that isn't the placeholder
        mostRecentFile = files.find(file => file.name !== '.emptyFolderPlaceholder');
    }

    if (mostRecentFile) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${mostRecentFile.name}`;
      
      try {
        // Use the same server action as the /photo page
        const analysisResult = await analyzePhotoForObjects(publicUrl);
        return NextResponse.json(analysisResult);
      } catch (analysisError) {
        console.error("AI analysis failed:", analysisError);
        const message = analysisError instanceof Error ? analysisError.message : "An unknown analysis error occurred.";
        return NextResponse.json({ error: "AI analysis failed.", details: message }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "No photos found in the bucket." }, { status: 404 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unknown error occurred.";
    console.error("Failed to process request:", err)
    return NextResponse.json({ error: "Failed to process request.", details: message }, { status: 500 });
  }
}
