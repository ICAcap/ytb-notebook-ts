import { prisma } from "../lib/prisma";
import { NOTE_COLORS } from "../utils/noteColors";

const TEST_USER_ID = "80NiPuUDjCKqKX5de08KQxLUIFpwHnzY";
const TEST_VID_ID = "cmqn28l5r0000jou21ty2pid4";

const colorValues = NOTE_COLORS.map((c) => c.value);

const loremSentences = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation.",
  "Ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
  "Dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
  "Sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
  "Doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.",
  "Veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
  "Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  "Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.",
  "Ut labore et dolore magnam aliquam quaerat voluptatem.",
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor(): string {
  return colorValues[getRandomInt(0, colorValues.length - 1)];
}

function getRandomMarks(): { type: string }[] {
  const marks: { type: string }[] = [];
  if (Math.random() > 0.7) marks.push({ type: "bold" });
  if (Math.random() > 0.7) marks.push({ type: "italic" });
  if (Math.random() > 0.8) marks.push({ type: "underline" });
  return marks;
}

function generateLoremContent(lengthType: "short" | "medium" | "long"): string {
  let sentenceCount = 1;
  if (lengthType === "medium") sentenceCount = getRandomInt(2, 4);
  if (lengthType === "long") sentenceCount = getRandomInt(5, 8);

  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(loremSentences[getRandomInt(0, loremSentences.length - 1)]);
  }
  return sentences.join(" ");
}

function generateTiptapContent(text: string) {
  const lengthType =
    text.length < 100 ? "short" : text.length < 300 ? "medium" : "long";
  const sentenceCount =
    lengthType === "short" ? 1 : lengthType === "medium" ? getRandomInt(1, 2) : getRandomInt(2, 3);

  const sentences = text.split(". ").slice(0, sentenceCount);
  const paragraphs = sentences.map((sentence) => ({
    type: "paragraph",
    content: [
      {
        type: "text",
        text: sentence.endsWith(".") ? sentence : sentence + ".",
        marks: getRandomMarks(),
      },
    ],
  }));

  return {
    type: "doc",
    content: paragraphs.length > 0 ? paragraphs : [
      {
        type: "paragraph",
        content: [{ type: "text", text: text }],
      },
    ],
  };
}

function generateRandomNotes(count: number) {
  const notes = [];
  let currentTime = 0;

  for (let i = 0; i < count; i++) {
    const lengthType = ["short", "medium", "long"][
      getRandomInt(0, 2)
    ] as "short" | "medium" | "long";
    const loremText = generateLoremContent(lengthType);
    const duration = getRandomInt(5, 30);
    const startTime = currentTime;
    const endTime = startTime + duration;

    notes.push({
      startTime,
      endTime,
      color: getRandomColor(),
      content: generateTiptapContent(loremText),
    });

    currentTime = endTime + getRandomInt(1, 15);
  }

  return notes;
}

async function seedNotes() {
  try {
    const notes = generateRandomNotes(500);

    for (const note of notes) {
      await prisma.note.create({
        data: {
          userId: TEST_USER_ID,
          videoId: TEST_VID_ID,
          startTime: note.startTime,
          endTime: note.endTime,
          color: note.color,
          content: note.content,
        },
      });
    }
    console.log("✅ Seeded 500 randomized notes with various content lengths");
  } catch (error) {
    console.error("Failed to seed notes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedNotes();
