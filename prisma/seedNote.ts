import { prisma } from "../lib/prisma";
import { NOTE_COLORS } from "../utils/noteColors";

const TEST_USER_ID = "80NiPuUDjCKqKX5de08KQxLUIFpwHnzY";
const TEST_VID_ID = "cmqn28l5r0000jou21ty2pid4";
const ASMR_CAFE_VID_ID = "cmq5ya07a0002j0u23uy3lo53";

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

const coffeeSentences = [
  "That pour-over bloom sounds so satisfying.",
  "Love the sound of the espresso grinder here.",
  "The crema on that shot looks perfect.",
  "This is making me want a cortado right now.",
  "The steam wand hiss is so relaxing.",
  "That's a nice single-origin Ethiopian roast, I bet.",
  "The way she taps the portafilter is oddly soothing.",
  "I could listen to that drip coffee sound all day.",
  "The latte art on that cup is beautiful.",
  "Cold brew dripping that slowly is mesmerizing.",
  "The clink of the cup against the saucer is so cozy.",
  "That French press plunge sound is my favorite.",
  "The aroma must be incredible right about now.",
  "She's tamping the espresso grounds so precisely.",
  "The milk frothing sound always relaxes me.",
  "That's a beautiful rosetta latte art pour.",
  "The coffee beans rattling in the grinder hopper is nice.",
  "I love the sound of the kettle just starting to whistle.",
  "That siphon coffee maker bubbling is hypnotic.",
  "The barista's rhythm with the scale timer is so calm.",
  "That's the perfect roast color for a light drip coffee.",
  "The sound of ice cubes into the iced latte is great.",
  "Watching the coffee drip through the filter paper slowly.",
  "That flat white looks silky smooth.",
  "The espresso machine's hum in the background is comforting.",
  "She's swirling the cup to check the crema color.",
  "That's a nice chemex setup on the counter.",
  "The coffee cherries reference on the menu board is a nice touch.",
  "I like how she wipes down the portafilter between shots.",
  "That americano pour with hot water is so gentle.",
];

const nonCoffeeSentences = [
  "The rain outside the window sounds so peaceful.",
  "That cat walking across the counter is adorable.",
  "The pages of that book turning are so quiet and nice.",
  "I like the soft jazz playing in the background.",
  "The candle flickering on the table is a nice touch.",
  "That plant on the windowsill looks so healthy.",
  "The wooden chairs scraping the floor is a familiar sound.",
  "Someone's typing on a laptop keyboard nearby.",
  "The clock ticking on the wall is subtle but nice.",
  "That tote bag on the chair has a cute design.",
  "The sunlight through the curtains looks so warm.",
  "I like the sound of pages in a notebook being flipped.",
  "The pastry case display looks really well organized.",
  "That string of fairy lights adds a cozy vibe.",
  "The soft chatter in the background is comforting.",
  "Someone just walked in and the door chime rang.",
  "The wooden table texture looks really nice in this light.",
  "That vintage radio prop on the shelf is a nice detail.",
  "I like how the light reflects off the window glass.",
  "The chalkboard menu lettering is really well done.",
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

function generateSentenceTiptapContent(text: string) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text,
            marks: getRandomMarks(),
          },
        ],
      },
    ],
  };
}

const CAFE_MAX_TIME_SECONDS = 30 * 60; // scatter notes across first 30 minutes

function generateCafeNotes() {
  const pool = [
    ...coffeeSentences.map((text) => ({ text, topic: "coffee" as const })),
    ...nonCoffeeSentences.map((text) => ({ text, topic: "other" as const })),
  ];

  // shuffle so coffee/non-coffee notes are scattered, not grouped
  for (let i = pool.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const startTimes = new Set<number>();
  while (startTimes.size < pool.length) {
    startTimes.add(getRandomInt(0, CAFE_MAX_TIME_SECONDS - 30));
  }
  const sortedStartTimes = Array.from(startTimes).sort((a, b) => a - b);

  return pool.map((entry, i) => {
    const startTime = sortedStartTimes[i];
    const duration = getRandomInt(5, 20);
    const endTime = Math.min(startTime + duration, CAFE_MAX_TIME_SECONDS);

    return {
      startTime,
      endTime,
      color: getRandomColor(),
      content: generateSentenceTiptapContent(entry.text),
    };
  });
}

const MAX_TIME_SECONDS = 20 * 60; // notes limited to first 20 minutes

function generateRandomNotes(count: number) {
  const notes = [];
  let currentTime = 0;

  for (let i = 0; i < count; i++) {
    const lengthType = ["short", "medium", "long"][
      getRandomInt(0, 2)
    ] as "short" | "medium" | "long";
    const loremText = generateLoremContent(lengthType);
    const duration = getRandomInt(5, 30);
    const startTime = currentTime % MAX_TIME_SECONDS;
    const endTime = Math.min(startTime + duration, MAX_TIME_SECONDS);

    notes.push({
      startTime,
      endTime,
      color: getRandomColor(),
      content: generateTiptapContent(loremText),
    });

    currentTime = (endTime + getRandomInt(1, 15)) % MAX_TIME_SECONDS;
  }

  return notes;
}

async function seedNotes() {
  try {
    const notes = generateRandomNotes(200);

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
    console.log("✅ Seeded 200 randomized notes with various content lengths");

    const cafeNotes = generateCafeNotes();
    for (const note of cafeNotes) {
      await prisma.note.create({
        data: {
          userId: TEST_USER_ID,
          videoId: ASMR_CAFE_VID_ID,
          startTime: note.startTime,
          endTime: note.endTime,
          color: note.color,
          content: note.content,
        },
      });
    }
    console.log(
      "✅ Seeded 50 ASMR cafe notes (30 coffee-related, 20 unrelated) scattered in the first 30 minutes"
    );
  } catch (error) {
    console.error("Failed to seed notes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedNotes();
