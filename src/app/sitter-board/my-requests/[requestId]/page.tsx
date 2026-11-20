import { connection } from 'next/server';
import { redirect } from 'next/navigation';

// Owners manage applicants on the request detail page
export default async function MySitterRequestDetailPage({
  params,
}: PageProps<'/sitter-board/my-requests/[requestId]'>) {
  await connection();
  const { requestId } = await params;
  redirect(`/sitter-board/${requestId}#applicants`);
}
