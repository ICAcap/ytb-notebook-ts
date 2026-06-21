import { prisma } from "../lib/prisma";

const TEST_USER_ID = "80NiPuUDjCKqKX5de08KQxLUIFpwHnzY";
const TEST_VID_ID = "cmqn28l5r0000jou21ty2pid4";

// Tiptap JSON with various styling variations
const notes = [
  {
    startTime: 0,
    endTime: 10,
    color: "#FF6B6B",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              marks: [{ type: "bold" }],
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 15,
    endTime: 30,
    color: "#4ECDC4",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              marks: [{ type: "italic" }],
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 35,
    endTime: 50,
    color: "#FFE66D",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Ut enim ad minim veniam, quis nostrud exercitation.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Ullamco laboris nisi ut aliquip ex ea commodo consequat.",
              marks: [{ type: "underline" }],
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 55,
    endTime: 75,
    color: "#95E1D3",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
              marks: [{ type: "bold" }, { type: "italic" }],
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 80,
    endTime: 100,
    color: "#F38181",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 105,
    endTime: 120,
    color: "#AA96DA",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Sunt in culpa qui officia deserunt mollit anim id est laborum.",
              marks: [{ type: "underline" }],
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 125,
    endTime: 140,
    color: "#FCBAD3",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
              marks: [{ type: "bold" }],
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 145,
    endTime: 160,
    color: "#A8E6CF",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
              marks: [{ type: "italic" }],
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 165,
    endTime: 180,
    color: "#FFD3B6",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Eos qui ratione voluptatem sequi nesciunt.",
              marks: [{ type: "underline" }],
            },
          ],
        },
      ],
    },
  },
  {
    startTime: 185,
    endTime: 200,
    color: "#FFDDC1",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
              marks: [{ type: "bold" }, { type: "italic" }, { type: "underline" }],
            },
          ],
        },
      ],
    },
  },
];

async function seedNotes() {
  try {
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
    console.log("✅ Seeded 10 notes");
  } catch (error) {
    console.error("Failed to seed notes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedNotes();
