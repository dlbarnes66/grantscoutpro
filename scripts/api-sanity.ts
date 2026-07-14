import fetch from "node-fetch";

async function main() {
  const baseUrl = "http://localhost:3000";

  const routes = [
    "/api/workspaces",
    "/api/grants",
    "/api/documents",
    "/api/files",
    "/api/embeddings",
    "/api/comparisons",
    "/api/reports",
    "/api/saved",
    "/api/portfolio",
  ];

  for (const route of routes) {
    try {
      const res = await fetch(baseUrl + route);
      console.log(route, res.status);
    } catch (e) {
      console.error("Error hitting", route, e);
    }
  }
}

main();
