import { prisma } from "./prisma";

export const cleanDemoAccounts = async () => {
	try {
		// earlier than 45 mins ago considered to be expired
		const expiryDate = new Date(new Date().getTime() - 45 * 60 * 1000);
		// const expiryDate = new Date(new Date().getTime() - 3000);

		await prisma.user.deleteMany({
			where: {
				isAnonymous: true,
				createdAt: {
					lt: expiryDate,
				},
			},
		});
	} catch (error) {
		console.error("Failed to clean demo accounts:", error);
	}
};
