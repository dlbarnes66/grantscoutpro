import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // User
  const user = await prisma.user.create({
    data: {
      email: "demo@grantscoutpro.com",
      name: "Demo User",
    },
  });

  // Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      ownerId: user.id,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "owner",
    },
  });

  // Grants
  const grants = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.grant.create({
        data: {
          workspaceId: workspace.id,
          title: `Demo Grant ${i + 1}`,
          description: "Seeded grant for demo environment",
          source: "FEDERAL",
          tierAccess: "FEDERAL_ONLY",
        },
      })
    )
  );

  // Documents
  const doc1 = await prisma.document.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      title: "Demo Document 1",
      content: { text: "This is a demo document." },
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      title: "Demo Document 2",
      content: { text: "This is another demo document." },
    },
  });

  // Files
  await prisma.file.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      documentId: doc1.id,
      filename: "demo1.txt",
      mimeType: "text/plain",
      size: 20,
      url: "https://example.com/demo1.txt",
      storage: "local",
    },
  });

  await prisma.file.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      documentId: doc2.id,
      filename: "demo2.txt",
      mimeType: "text/plain",
      size: 22,
      url: "https://example.com/demo2.txt",
      storage: "local",
    },
  });

  // Embeddings
  await prisma.embedding.create({
    data: {
      workspaceId: workspace.id,
      documentId: doc1.id,
      userId: user.id,
      vector: [0.1, 0.2, 0.3],
    },
  });

  await prisma.embedding.create({
    data: {
      workspaceId: workspace.id,
      documentId: doc2.id,
      userId: user.id,
      vector: [0.4, 0.5, 0.6],
    },
  });

  // Saved Search
  await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name: "Demo Search",
      query: "education grants",
    },
  });

  // Saved Grant
  await prisma.savedGrant.create({
    data: {
      userId: user.id,
      grantId: grants[0].id,
    },
  });

  // Comparison
  await prisma.grantComparison.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      grants: grants.map((g) => g.id),
      name: "Demo Comparison",
    },
  });

  // Report
  await prisma.report.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      title: "Demo Report",
      content: "This is a seeded report.",
    },
  });

  // Portfolio Optimization
  await prisma.portfolioOptimization.create({
    data: {
      userId: user.id,
      grantId: grants[0].id,
      details: { score: 0.88 },
    },
  });

  console.log("Seed completed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
