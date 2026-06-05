import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { getYoutubeId } from "../utils/youtube.js";

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
		"https://www.youtube.com/watch?v=Dk25lwdTKow&list=WL&index=50&pp=iAQBsAgC",
		"https://www.youtube.com/watch?v=j7Qu65rUcsY&list=WL&index=54&pp=iAQBsAgC",
		"https://www.youtube.com/watch?v=pw14NzfYPa8&list=WL&index=59&pp=iAQBsAgC",
		"https://www.youtube.com/watch?v=AknbizcLq4w&list=WL&index=43&pp=iAQBsAgC",
		"https://www.youtube.com/watch?v=Cie5v59mrTg&list=WL&index=14&pp=iAQBsAgC",
		"https://www.youtube.com/watch?v=U9PYyMhDc_k&list=WL&index=11&pp=iAQB0gcJCSgLAYcqIYzvsAgC",
		"https://www.youtube.com/watch?v=5Rp0qBThQAI&list=PLhnazjUB_WkIYSMrMKYwHDfN7-9AeRmui&index=11",
		"https://www.youtube.com/watch?v=OK_OyQxce7Q",
		"https://www.youtube.com/watch?v=GVqt524azcY",
		"https://www.youtube.com/watch?v=EPKkjUpwwGY",
		"https://www.youtube.com/watch?v=mYT0X7oLoVo",
		"https://www.youtube.com/watch?v=D2SI3Uc_Erk",
		"https://www.youtube.com/watch?v=wPzzciaJzUA",
		"https://www.youtube.com/watch?v=lE_11_paGoA",
		"https://www.youtube.com/shorts/fzCvDsoviKk",
		"https://www.youtube.com/shorts/iwYxrHF2T80",
	];

	const videos = Array.from({ length: urls.length }, (_, i) => ({
		userId: meId,
		youtubeVidID: getYoutubeId(urls[i])!,
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
