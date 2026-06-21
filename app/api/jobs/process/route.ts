import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  // Find all queued jobs
  const jobs = await prisma.job.findMany({
    where: { status: "queued" },
  });

  for (const job of jobs) {
    try {
      //
      // ⭐ STEP 0 — Mark job as processing
      //
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "processing" },
      });

      await prisma.jobLog.create({
        data: {
          jobId: job.id,
          message: `🚀 Starting grant extraction for query: ${job.text}`,
        },
      });

      //
      // ⭐ STEP 1 — Search for real grant URLs
      //
      const searchRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/search-grants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: job.text }),
        }
      );

      const searchData = await searchRes.json();
      const grantUrls: string[] = searchData.urls || [];

      await prisma.jobLog.create({
        data: {
          jobId: job.id,
          message: `🔎 Found ${grantUrls.length} grant URLs.`,
        },
      });

      const extractedGrants = [];

      //
      // ⭐ STEP 2 — Extract each grant using hybrid engine
      //
      for (const url of grantUrls) {
        await prisma.jobLog.create({
          data: {
            jobId: job.id,
            message: `📄 Extracting grant from URL: ${url}`,
          },
        });

        const extractRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/extract-grant`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          }
        );

        if (!extractRes.ok) {
          await prisma.jobLog.create({
            data: {
              jobId: job.id,
              message: `❌ Extraction failed for ${url}: ${await extractRes.text()}`,
            },
          });
          continue;
        }

        const extractData = await extractRes.json();
        const extractedGrant = extractData.grant;

        extractedGrants.push(extractedGrant);

        await prisma.jobLog.create({
          data: {
            jobId: job.id,
            message: `✅ Extracted grant: ${extractedGrant.title}`,
          },
        });

        //
        // ⭐ STEP 3 — Score each extracted grant
        //
        await prisma.jobLog.create({
          data: {
            jobId: job.id,
            message: `📊 Scoring grant: ${extractedGrant.title}`,
          },
        });

        const scoreRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/score-grant`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grantId: extractedGrant.id,
              userId: job.userId,
            }),
          }
        );

        if (!scoreRes.ok) {
          await prisma.jobLog.create({
            data: {
              jobId: job.id,
              message: `⚠️ Scoring failed for ${extractedGrant.title}: ${await scoreRes.text()}`,
            },
          });
        } else {
          await prisma.jobLog.create({
            data: {
              jobId: job.id,
              message: `🏆 Scored grant: ${extractedGrant.title}`,
            },
          });
        }
      }

      //
      // ⭐ STEP 4 — Save all extracted grants to JobResult
      //
      await prisma.jobResult.upsert({
        where: { jobId: job.id },
        update: { result: extractedGrants },
        create: {
          jobId: job.id,
          result: extractedGrants,
        },
      });

      //
      // ⭐ STEP 5 — Mark job completed
      //
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "completed" },
      });

      await prisma.jobLog.create({
        data: {
          jobId: job.id,
          message: `🎉 Job completed. Extracted & scored ${extractedGrants.length} grants.`,
        },
      });
    } catch (err: any) {
      //
      // ⭐ ERROR HANDLING — Mark job failed
      //
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "failed" },
      });

      await prisma.jobLog.create({
        data: {
          jobId: job.id,
          message: `❌ Job failed: ${err?.message || "Unknown error"}`,
        },
      });
    }
  }

  return NextResponse.json({ processed: jobs.length });
}
