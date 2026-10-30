import { prisma } from "../client";
import { seedUuid } from "./helpers";
import { photos } from "./photos";
import { userId } from "./users";

const MINUTE = 60 * 1000;

// likedBy = who liked the post. likeCount is calculated from this list,
// so it always matches the PostLike rows (the prototype used made-up big numbers).
const posts = [
  {
    key: "5",
    author: "maya",
    type: "LOST_PET",
    imageUrl: photos.cat3,
    minutesAgo: 60,
    caption:
      "LOST PET: Luna slipped out of our Kitsilano apartment this morning. Grey tabby, very shy, pink collar with a bell. Please message me if you see her.",
    likedBy: ["ava", "daniel", "liam", "sophia", "emily"],
  },
  {
    key: "1",
    author: "maya",
    type: "GENERAL",
    imageUrl: photos.dog1,
    minutesAgo: 120,
    caption:
      "Found the perfect sunset spot after our long walk. Sunny refused to leave until the very last ray disappeared.",
    likedBy: ["daniel", "ava", "liam", "marcus", "sophia", "noah", "emily"],
  },
  {
    key: "2",
    author: "liam",
    type: "GENERAL",
    imageUrl: photos.dog3,
    minutesAgo: 1800,
    caption: "Milo made three new friends at the beach today.",
    likedBy: ["maya", "daniel", "noah"],
  },
  {
    key: "4",
    author: "ethan",
    type: "LOST_PET",
    imageUrl: photos.cat1,
    minutesAgo: 38,
    caption:
      "LOST PET: Ginger slipped out near East 12th Avenue last night. She is shy, wearing a teal collar, and may be hiding under porches. Please message me if seen.",
    likedBy: ["maya", "ava", "lucas"],
  },
  {
    key: "3",
    author: "ava",
    type: "GENERAL",
    imageUrl: photos.dog2,
    minutesAgo: 4320,
    caption:
      "Coffee stop before our seawall adventure. The team even brought Poppy her own water bowl.",
    likedBy: ["maya", "marcus"],
  },
] as const;

export async function seedCommunity() {
  let likeTotal = 0;

  for (const post of posts) {
    const id = seedUuid(`post:${post.key}`);
    const data = {
      authorId: userId(post.author),
      type: post.type,
      imageUrl: post.imageUrl,
      caption: post.caption,
      likeCount: post.likedBy.length,
      status: "ACTIVE",
    } as const;
    await prisma.communityPost.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
        createdAt: new Date(Date.now() - post.minutesAgo * MINUTE),
      },
    });

    await prisma.postLike.createMany({
      data: post.likedBy.map((likerKey) => ({
        postId: id,
        userId: userId(likerKey),
      })),
      skipDuplicates: true,
    });
    likeTotal += post.likedBy.length;
  }

  console.log(`Seeded ${posts.length} community posts and ${likeTotal} likes.`);
}
