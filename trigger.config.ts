import { TriggerConfig } from "@trigger.dev/sdk";

const config: TriggerConfig = {
  // Your Production project ID (must match Trigger dashboard)
  project: process.env.TRIGGER_PROJECT_ID!,

  // Node runtime (recommended for Next.js + Prisma)
  runtime: "node",

  // Logging level
  logLevel: "info",

  // Maximum task execution time (seconds)
  maxDuration: 3600,

  // Directory where your tasks are located
  dirs: ["./trigger"],
};

export default config;
