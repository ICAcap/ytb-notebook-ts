import { prisma } from "../lib/prisma";

const TEST_USER_ID = "80NiPuUDjCKqKX5de08KQxLUIFpwHnzY";

const collections = [
  "Favorites",
  "To Watch",
  "Educational",
  "Music",
  "Vlogs",
  "Tutorials",
  "Documentaries",
  "Gaming",
  "Comedy",
  "Tech Reviews",
];

async function seedCollections() {
  try {
    for (const name of collections) {
      await prisma.collection.upsert({
        where: {
          userId_collectionName: {
            userId: TEST_USER_ID,
            collectionName: name,
          },
        },
        update: {},
        create: {
          userId: TEST_USER_ID,
          collectionName: name,
        },
      });
    }
    console.log("✅ Seeded 10 collections");
  } catch (error) {
    console.error("Failed to seed collections:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCollections();
