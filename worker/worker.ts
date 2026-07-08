import "dotenv/config";                     // ⭐ Load .env FIRST
import { prisma } from "@/lib/prisma.ts";  // ⭐ ESM requires .ts extension
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,      // ⭐ Now correctly loaded
});

async function processJob(job: any) {
  await prisma.job.update({
    where: { id: job.id },
    data: { status: "processing" },
  });

  await prisma.jobLog.create({
    data: {
      jobId: job.id,
      message: "Job started",
    },
  });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a grant analysis engine." },
      { role: "user", content: job.text },
    ],
  });

  const output = response.choices[0].message.content;

  await prisma.jobResult.create({
    data: {
      jobId: job.id,
      result: { output },
    },
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "completed" },
  });

  await prisma.jobLog.create({
    data: {
      jobId: job.id,
      message: "Job completed successfully",
    },
  });
}

async function runWorker() {
  console.log("Worker started…");

  while (true) {
    const job = await prisma.job.findFirst({
      where: { status: "queued" },
    });

    if (job) {
      await processJob(job);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
}

runWorker();
