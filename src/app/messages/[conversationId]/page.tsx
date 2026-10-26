// Notion flow: Message between owner & sitter, Lost/found pet messages
// TODO: implement

import { Suspense } from "react";

export default function ConversationPage({
  params,
}: PageProps<"/messages/[conversationId]">) {
  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">Conversation</h1>
      <Suspense fallback={<p>Loading…</p>}>
        {params.then(({ conversationId }) => (
          <p>Conversation ID: {conversationId}</p>
        ))}
      </Suspense>
    </main>
  );
}
