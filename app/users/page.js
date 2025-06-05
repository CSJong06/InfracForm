import { getSession } from '@/lib/auth';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const session = await getSession();
  
  // Only check if user is authenticated, not if they're admin
  if (!session) {
    throw new Error('Unauthorized');
  }

  return <UsersClient session={session} />;
} 