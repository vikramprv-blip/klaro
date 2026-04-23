const fs = require("node:fs");

const envFile = fs.existsSync(".env.local") ? ".env.local" : (fs.existsSync(".env") ? ".env" : null);
if (envFile) {
  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (!(k in process.env)) process.env[k] = v;
  }
}

const apiKey = process.env.VOYAGE_API_KEY;
const model = process.env.VOYAGE_EMBED_MODEL || "voyage-3-large";

if (!apiKey || apiKey === "PASTE_YOUR_VOYAGE_API_KEY_HERE") {
  console.error("Set VOYAGE_API_KEY in .env.local or .env first");
  process.exit(1);
}

const { VoyageAIClient } = require("voyageai");

async function main() {
  const client = new VoyageAIClient({ apiKey });
  const res = await client.embed({
    input: ["klaro services ai search smoke test"],
    model,
  });

  const rows = res.data || [];
  console.log(JSON.stringify({
    ok: true,
    model,
    vectors: rows.length,
    dims: rows[0] && Array.isArray(rows[0].embedding) ? rows[0].embedding.length : 0
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
