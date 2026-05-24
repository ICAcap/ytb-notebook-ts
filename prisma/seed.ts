import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedAlice() {
	// Create Alice user first to get userId
	const alice = await prisma.user.upsert({
		where: { email: "alice@test.org" },
		update: {},
		create: {
			email: "alice@test.org",
			displayName: "Alice",
			isSuper: true,
		},
	});

	// Create Alice's videos with nested notes (userId passed explicitly)
	await prisma.video.create({
		data: {
			userId: alice.userId,
			url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
			title: "Rick Astley - Never Gonna Give You Up",
			notes: {
				create: [
					{
						userId: alice.userId,
						timestamp: 0,
						content: { message: "Classic rickroll" },
					},
					{
						userId: alice.userId,
						timestamp: 45,
						content: { message: "Great drop" },
					},
				],
			},
		},
	});

	const aliceVideo2 = await prisma.video.create({
		data: {
			userId: alice.userId,
			url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
			title: "PSY - GANGNAM STYLE",
			notes: {
				create: [
					{
						userId: alice.userId,
						timestamp: 0,
						content: { message: "Dance tutorial starts" },
					},
				],
			},
		},
	});

	// Create Alice's collections
	const aliceCollection1 = await prisma.collection.create({
		data: {
			userId: alice.userId,
			collectionName: "80s Hits",
		},
	});

	const aliceCollection2 = await prisma.collection.create({
		data: {
			userId: alice.userId,
			collectionName: "Iconic Music Videos",
		},
	});

	// Fetch Alice's videos to connect to collections
	const aliceVideos = await prisma.video.findMany({
		where: { userId: alice.userId },
	});

	// Connect all videos to first collection
	await prisma.collection.update({
		where: { collectionId: aliceCollection1.collectionId },
		data: {
			videos: {
				connect: aliceVideos.map((v) => ({ videoId: v.videoId })),
			},
		},
	});

	// Connect video2 to second collection
	await prisma.collection.update({
		where: { collectionId: aliceCollection2.collectionId },
		data: {
			videos: {
				connect: [{ videoId: aliceVideo2.videoId }],
			},
		},
	});

	return alice;
}

async function seedBob() {
	// Create Bob user first to get userId
	const bob = await prisma.user.upsert({
		where: { email: "bob@test.org" },
		update: {},
		create: {
			email: "bob@test.org",
			displayName: "Bob",
		},
	});

	// Create Bob's videos with nested notes
	const bobVideo1 = await prisma.video.create({
		data: {
			userId: bob.userId,
			url: "https://www.youtube.com/watch?v=kJQP7kiw9Fk",
			title: "Luis Fonsi - Despacito",
			notes: {
				create: [
					{
						userId: bob.userId,
						timestamp: 30,
						content: { message: "Chorus starts" },
					},
				],
			},
		},
	});

	// Create Bob's collection
	const bobCollection = await prisma.collection.create({
		data: {
			userId: bob.userId,
			collectionName: "Latin Music",
		},
	});

	// Connect video to collection
	await prisma.collection.update({
		where: { collectionId: bobCollection.collectionId },
		data: {
			videos: {
				connect: [{ videoId: bobVideo1.videoId }],
			},
		},
	});

	return bob;
}

async function seedClara() {
	// Create Clara user first to get userId
	const clara = await prisma.user.upsert({
		where: { email: "clara@test.org" },
		update: {},
		create: {
			email: "clara@test.org",
			displayName: "Clara",
		},
	});

	// Create Clara's videos with nested notes
	const claraVideo1 = await prisma.video.create({
		data: {
			userId: clara.userId,
			url: "https://www.youtube.com/watch?v=e-IWRmpefzE",
			title: "Adele - Hello",
			notes: {
				create: [
					{
						userId: clara.userId,
						timestamp: 10,
						content: { message: "Powerful vocals" },
					},
					{
						userId: clara.userId,
						timestamp: 120,
						content: { message: "Bridge section" },
					},
				],
			},
		},
	});

	// Create Clara's collection
	const claraCollection = await prisma.collection.create({
		data: {
			userId: clara.userId,
			collectionName: "Modern Ballads",
		},
	});

	// Connect video to collection
	await prisma.collection.update({
		where: { collectionId: claraCollection.collectionId },
		data: {
			videos: {
				connect: [{ videoId: claraVideo1.videoId }],
			},
		},
	});

	return clara;
}

async function main() {
	console.log("( •̀ ω •́ )y -- Deleting Existing Data...");
	await prisma.collection.deleteMany();
	await prisma.note.deleteMany();
	await prisma.video.deleteMany();
	await prisma.user.deleteMany();
	console.log("( •̀ ω •́ )y -- Deleting Existing Data Finished...");
	console.log("( •̀ ω •́ )y -- Seeding database...");

	await Promise.all([seedAlice(), seedBob(), seedClara()]);

	console.log("( •̀ ω •́ )y -- Seeding Completed!");
}

main()
	.then(async () => {
		await prisma.$disconnect();
		await pool.end();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		await pool.end();
		process.exit(1);
	});
