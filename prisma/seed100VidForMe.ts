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
	const url = "https://www.youtube.com/watch?v=25e9ni85d_w";

	// Create 100 videos with titles 1-100
	const videos = Array.from({ length: 100 }, (_, i) => ({
		userId: meId,
		url,
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
