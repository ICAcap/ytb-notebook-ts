import { JSONContent } from "@tiptap/react";
import { prisma } from "../lib/prisma";
import { tiptapToText } from "../utils/tiptapToText";

async function main() {
  const notes = await prisma.note.findMany({
    select: { noteId: true, content: true },
  });

  let updated = 0;
  for (const note of notes) {
    const contentText = tiptapToText(note.content as JSONContent);
    await prisma.note.update({
      where: { noteId: note.noteId },
      data: { contentText },
    });
    updated++;
  }

  console.log(`Backfilled contentText for ${updated} note(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
