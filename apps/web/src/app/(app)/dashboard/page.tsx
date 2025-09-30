import { Header } from '@/components/Header';

export default function Dashboard() {
  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))]">
      <Header />
      <main className="p-8">
        <h1 className="text-2xl font-semibold text-[hsl(var(--text))] mb-2">Dashboard</h1>
        <p className="text-[hsl(var(--text-muted))]">
          Signed-in area (public for now; auth later).
        </p>
      </main>
    </div>
  );
}
