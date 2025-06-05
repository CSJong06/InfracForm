import { requireAuth } from '@/lib/auth';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await requireAuth();
  
  return <DashboardClient session={session} />;
} 