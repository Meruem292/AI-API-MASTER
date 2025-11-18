import { ApiTester } from '@/components/api-tester';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
            Endpoint Ace
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your friendly neighborhood API endpoint tester.
          </p>
        </header>
        <ApiTester />
      </div>
    </main>
  );
}
