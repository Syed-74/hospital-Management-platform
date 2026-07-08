import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { ENV } from "./env.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: ENV.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Initialize Prisma Client
export const prisma = new PrismaClient({ adapter });
