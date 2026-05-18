//to instantiate Prisma Client with the Neon adapter

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaNeon } from "@prisma/adapter-neon";

// create adapter via pooled connection
const adapter = new PrismaNeon({
	connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
