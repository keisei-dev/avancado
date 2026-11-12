// Notion flow: Sitter Board: Create a sitter request
// TODO: implement

import { redirect } from 'next/navigation';
import { getCurrentMember, isAdminMember } from '@/lib/auth/member';

export const instant = false;

export default async function NewSitterRequestPage() {
  const member = await getCurrentMember();
  if (member && isAdminMember(member)) redirect('/sitter-board');

  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">Create Sitter Request</h1>
    </main>
  );
}
