import { prisma } from "../client";
import { seedUuid } from "./helpers";
import { userId } from "./users";

const MINUTE = 60 * 1000;

// owner     = the author of the request or post
// initiator = who started the chat (the applicant, or the person who found the pet)
// contextKey = the key of the request ("2403") or the post ("5")
// messages   = [sender, minutes ago, text]
const conversations = [
  {
    key: "daniel-2403",
    type: "SITTING",
    contextKey: "2403",
    owner: "maya",
    initiator: "daniel",
    mayaHasRead: false,
    archivedByMaya: false,
    messages: [
      [
        "daniel",
        150,
        "Hi Maya! I’m looking forward to meeting Sunny on Saturday. Is there anything special I should bring?",
      ],
      [
        "maya",
        137,
        "His harness and treats will be by the door. He loves the beach route near Kitsilano.",
      ],
      ["daniel", 126, "Perfect. I’ll send a photo update after our walk."],
    ],
  },
  {
    key: "ava-5",
    type: "LOST_FOUND",
    contextKey: "5",
    owner: "maya",
    initiator: "ava",
    mayaHasRead: false,
    archivedByMaya: false,
    messages: [
      [
        "ava",
        210,
        "Hi! I think I found Luna. A shy grey tabby with a pink collar is hiding under the stairs at 2150 W 5th.",
      ],
    ],
  },
  {
    key: "noah-2407",
    type: "SITTING",
    contextKey: "2407",
    owner: "noah",
    initiator: "maya",
    mayaHasRead: true,
    archivedByMaya: false,
    messages: [
      [
        "noah",
        1500,
        "Thanks for offering to help with Milo! The leash is on the hook by the door.",
      ],
      [
        "maya",
        1496,
        "Great, I’ll be there at 1:30. Does he get treats on walks?",
      ],
      ["noah", 1490, "Yes, two or three. He’ll remind you!"],
    ],
  },
  {
    key: "ava-2402",
    type: "SITTING",
    contextKey: "2402",
    owner: "maya",
    initiator: "ava",
    mayaHasRead: true,
    archivedByMaya: true,
    messages: [
      [
        "ava",
        57500,
        "Luna’s all set. Food and water refreshed, and she played with the feather toy.",
      ],
      ["maya", 57496, "Thank you so much, Ava!"],
    ],
  },
] as const;

export function conversationId(key: (typeof conversations)[number]["key"]) {
  return seedUuid(`conversation:${key}`);
}

export async function seedConversations() {
  let messageCount = 0;

  for (const conversation of conversations) {
    const id = conversationId(conversation.key);
    const isSitting = conversation.type === "SITTING";
    const data = {
      type: conversation.type,
      initiatorId: userId(conversation.initiator),
      sitterRequestId: isSitting
        ? seedUuid(`request:${conversation.contextKey}`)
        : null,
      postId: isSitting ? null : seedUuid(`post:${conversation.contextKey}`),
    };
    await prisma.conversation.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });

    // A conversation has exactly two participants: the owner and the initiator.
    for (const participantKey of [
      conversation.owner,
      conversation.initiator,
    ] as const) {
      const participantId = userId(participantKey);
      const isMaya = participantKey === "maya";
      const participantData = {
        // null = never read, so every message from the other person is unread.
        lastReadAt: isMaya && !conversation.mayaHasRead ? null : new Date(),
        archivedAt:
          isMaya && conversation.archivedByMaya
            ? new Date(Date.now() - 39 * 24 * 60 * MINUTE)
            : null,
      };
      await prisma.conversationParticipant.upsert({
        where: {
          conversationId_userId: { conversationId: id, userId: participantId },
        },
        update: participantData,
        create: {
          conversationId: id,
          userId: participantId,
          ...participantData,
        },
      });
    }

    for (const [
      index,
      [sender, minutesAgo, text],
    ] of conversation.messages.entries()) {
      const messageId = seedUuid(`message:${conversation.key}:${index}`);
      await prisma.message.upsert({
        where: { id: messageId },
        update: { content: text },
        create: {
          id: messageId,
          conversationId: id,
          senderId: userId(sender),
          content: text,
          createdAt: new Date(Date.now() - minutesAgo * MINUTE),
        },
      });
      messageCount += 1;
    }
  }

  console.log(
    `Seeded ${conversations.length} conversations and ${messageCount} messages.`,
  );
}
