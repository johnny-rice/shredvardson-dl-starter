import { AnalyticsProvider } from '@/components/AnalyticsProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}
