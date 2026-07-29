import { defineConfig } from "@trigger.dev/sdk";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
  project: "proj_kczfpfsezcsakeijsuct",
  dirs: ["./trigger"],
  maxDuration: 3600,
  build: {
    extensions: [prismaExtension({ mode: "modern" })],
  },
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      randomize: true,
    },
  },
});
