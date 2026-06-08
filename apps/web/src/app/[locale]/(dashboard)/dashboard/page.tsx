import { Text } from '@/components/ui/text';
import { protectedRequest } from '@/utils/api';
import { LogoutButton } from './_components/LogoutButton';

export default async function DashboardPage() {
  const events = await protectedRequest('/events');

  console.log(events);

  return (
    <main className="bg-background min-h-screen p-12">
      <Text variant="heading-xl">Dashboard</Text>
      <LogoutButton />
    </main>
  );
}
