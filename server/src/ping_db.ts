import { prisma } from "./db.ts";

async function ping() {
	const foundUser = (await prisma.user.findFirst()) || null;

	if (foundUser) {
		console.log("READ 1st User");
		console.log(`${JSON.stringify(foundUser)}`);
	}

	console.log("Test complete");
}

ping()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
