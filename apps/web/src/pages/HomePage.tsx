import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedBackground from '@/components/AnimatedBackground';
import { env } from '@/lib/env';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Camera className="h-5 w-5 text-primary" />
            <span>Pixel Club</span>
          </div>
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {env.appName}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A centralized platform for Pixel Club, Government College of Engineering, Karad.
            Submit photography requests, browse published albums, and stay in sync with the team.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/login">Get started</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photography requests</CardTitle>
              <CardDescription>Submit and track event photography requests.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Request, edit while pending, and watch status as the team works on it.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Albums</CardTitle>
              <CardDescription>Year-wise gallery of published albums.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Browse compressed previews and download originals from Google Drive.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team</CardTitle>
              <CardDescription>Meet the people behind the lens.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Batch-wise history of all contributors to the club.
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Pixel Club, GCE Karad.
      </footer>
    </div>
  );
}
