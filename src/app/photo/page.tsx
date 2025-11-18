import Image from 'next/image';

export default function PhotoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">Most Recent Photo</h1>
        <div className="relative aspect-video">
          <Image
            src="https://gjfwrphhhgodjhtgwmum.supabase.co/storage/v1/object/public/polyBitePhoto/closest_11551.jpg"
            alt="Recent Photo"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </main>
  );
}
