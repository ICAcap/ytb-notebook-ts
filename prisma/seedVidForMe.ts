import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	const meId = process.env.TEST_USER_ID!;
	await prisma.video.deleteMany({
		where: { userId: meId },
	});

	const urls = [
		"https://www.youtube.com/watch?v=XqZsoesa55w", // Baby Shark Dance
		"https://www.youtube.com/watch?v=kJQP7kiw5Fk", // Despacito
		"https://www.youtube.com/watch?v=e_04ZrNroTo", // Wheels on the Bus
		"https://www.youtube.com/watch?v=WRVsOCh907o", // Bath Song
		"https://www.youtube.com/watch?v=F4tHL8reNCs", // Johny Johny Yes Papa
		"https://www.youtube.com/watch?v=RgKAFK5djSk", // See You Again
		"https://www.youtube.com/watch?v=hq3yfQnllfQ", // Phonics Song
		"https://www.youtube.com/watch?v=JGwWNGJdvx8", // Shape of You
		"https://www.youtube.com/watch?v=9bZkp7q19f0", // Gangnam Style
		"https://www.youtube.com/watch?v=k85mRPqvMbE", // Crazy Frog - Axel F
		"https://www.youtube.com/watch?v=OPf0YbXqDm0", // Uptown Funk
		"https://www.youtube.com/watch?v=FzG4uDgje3M", // Dame Tu Cosita
		"https://www.youtube.com/watch?v=AETFvQonfV8", // Shree Hanuman Chalisa
		"https://www.youtube.com/watch?v=MR5XSOdjKMA", // Baa Baa Black Sheep
		"https://www.youtube.com/watch?v=KYniUCGPGLs", // Masha and the Bear
		"https://www.youtube.com/watch?v=hT_nvWreIhg", // Counting Stars
		"https://www.youtube.com/watch?v=09R8_2nJtjg", // Sugar
		"https://www.youtube.com/watch?v=CevxZvSJLk8", // Roar
		"https://www.youtube.com/watch?v=0KSOMA3QBU0", // Dark Horse
		"https://www.youtube.com/watch?v=2Vv-BfVoq4g", // Perfect
	];

	const videos = Array.from({ length: urls.length }, (_, i) => ({
		userId: meId,
		url: urls[i],
		title: String(i + 1),
	}));

	const result = await prisma.video.createMany({
		data: videos,
	});

	console.log(`Created ${result.count} videos`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
