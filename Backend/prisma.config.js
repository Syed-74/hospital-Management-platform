import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    seed: 'node seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
