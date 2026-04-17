import fs from "fs";
import path from "path";

const root = process.cwd();

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "dist", "build"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function firstExisting(paths) {
  return paths.find((p) => fs.existsSync(path.join(root, p)));
}

const files = walk(root);
const schemaPath =
  firstExisting(["prisma/schema.prisma", "src/prisma/schema.prisma"]) ||
  files.find((f) => f.endsWith("schema.prisma"));

if (!schemaPath) {
  console.error("schema.prisma not found");
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, "utf8");

const modelCandidates = ["Task", "WorkItem", "Work", "Job", "BoardTask"];
let modelName =
  modelCandidates.find((m) => new RegExp(`model\\s+${m}\\s+\\{`, "m").test(schema));

if (!modelName) {
  const models = [...schema.matchAll(/^model\s+([A-Za-z_][A-Za-z0-9_]*)\s+\{/gm)].map((m) => m[1]);
  modelName =
    models.find((m) => /task|work|job/i.test(m)) ||
    models[0];
}

if (!modelName) {
  console.error("No Prisma model found");
  process.exit(1);
}

const modelBlockMatch = schema.match(new RegExp(`model\\s+${modelName}\\s+\\{([\\s\\S]*?)\\n\\}`, "m"));
if (!modelBlockMatch) {
  console.error(`Could not read Prisma model block for ${modelName}`);
  process.exit(1);
}
const modelBlock = modelBlockMatch[1];

const statusField =
  ["status", "workStatus", "column", "stage"].find((f) => new RegExp(`^\\s*${f}\\s+`, "m").test(modelBlock)) ||
  "status";

const orderField =
  ["position", "order", "sortOrder", "rank"].find((f) => new RegExp(`^\\s*${f}\\s+`, "m").test(modelBlock)) ||
  null;

const idLineMatch = modelBlock.match(/^\s*id\s+(String|Int|BigInt)\b/m);
const idType = idLineMatch ? idLineMatch[1] : "String";

const prismaImportPath =
  firstExisting([
    "lib/prisma.ts",
    "lib/prisma.tsx",
    "src/lib/prisma.ts",
    "src/lib/prisma.tsx",
    "utils/prisma.ts",
    "src/utils/prisma.ts",
  ]);

if (!prismaImportPath) {
  console.error("Could not find prisma client helper (expected lib/prisma.ts or similar)");
  process.exit(1);
}

const routeImport = "/" + path.relative(path.join(root, "app/api/workboard/[id]"), path.join(root, prismaImportPath)).replace(/\\/g, "/").replace(/\.(ts|tsx|js|jsx)$/, "");

const modelAccessor = modelName.charAt(0).toLowerCase() + modelName.slice(1);
const idParseExpr =
  idType === "Int" ? "Number(params.id)" :
  idType === "BigInt" ? "BigInt(params.id)" :
  "params.id";

const routeSource = `import { NextResponse } from "next/server";
import { prisma } from "${routeImport}";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.${statusField} !== undefined) data.${statusField} = body.${statusField};
    ${orderField ? `if (body.${orderField} !== undefined) data.${orderField} = body.${orderField};` : ""}

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "No update payload supplied" }, { status: 400 });
    }

    const updated = await prisma.${modelAccessor}.update({
      where: { id: ${idType === "String" ? "id" : idParseExpr.replace("params.id", "id")} },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("workboard PATCH failed", error);
    return NextResponse.json({ error: "Failed to update work item" }, { status: 500 });
  }
}
`;
fs.mkdirSync(path.join(root, "app/api/workboard/[id]"), { recursive: true });
fs.writeFileSync(path.join(root, "app/api/workboard/[id]/route.ts"), routeSource);

const uiCandidates = files
  .filter((f) => /\.(tsx|ts|jsx|js)$/.test(f))
  .filter((f) => !f.includes("/app/api/"))
  .map((f) => ({
    file: f,
    text: fs.readFileSync(f, "utf8"),
  }))
  .filter(({ text }) => /DndContext|onDragEnd|handleDragEnd/.test(text))
  .sort((a, b) => {
    const sa =
      (/workboard/i.test(a.file) ? 10 : 0) +
      (/DndContext/.test(a.text) ? 5 : 0) +
      (/handleDragEnd/.test(a.text) ? 5 : 0);
    const sb =
      (/workboard/i.test(b.file) ? 10 : 0) +
      (/DndContext/.test(b.text) ? 5 : 0) +
      (/handleDragEnd/.test(b.text) ? 5 : 0);
    return sb - sa;
  });

if (!uiCandidates.length) {
  console.log("API route created, but no workboard drag file was auto-detected.");
  process.exit(0);
}

const uiFile = uiCandidates[0].file;
let src = fs.readFileSync(uiFile, "utf8");

if (!src.includes("persistWorkboardMove(")) {
  const helper = `
async function persistWorkboardMove(id: string, nextStatus: string, nextPosition?: number) {
  const res = await fetch(\`/api/workboard/\${id}\`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ${statusField}: nextStatus,
      ${orderField ? `${orderField}: nextPosition,` : ""}
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to persist workboard move");
  }

  return res.json();
}

`;
  if (/^["']use client["'];\s*/.test(src)) {
    src = src.replace(/^["']use client["'];\s*/, (m) => `${m}\n${helper}`);
  } else {
    src = helper + src;
  }
}

function patchHandleDragEnd(code) {
  const patterns = [
    /const\s+handleDragEnd\s*=\s*(async\s*)?\(([^)]*)\)\s*=>\s*\{/m,
    /function\s+handleDragEnd\s*\(([^)]*)\)\s*\{/m,
  ];

  let match, mode;
  for (const p of patterns) {
    match = code.match(p);
    if (match) {
      mode = p;
      break;
    }
  }
  if (!match) return code;

  const start = match.index + match[0].length;
  const openBraceIndex = code.indexOf("{", match.index);
  let depth = 0;
  let end = -1;
  for (let i = openBraceIndex; i < code.length; i++) {
    const ch = code[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
  if (end === -1) return code;

  let fnHeader = code.slice(match.index, openBraceIndex + 1);
  let fnBody = code.slice(start, end);

  if (!/const\s+handleDragEnd\s*=\s*async\s*\(/.test(fnHeader) && /const\s+handleDragEnd/.test(fnHeader)) {
    fnHeader = fnHeader.replace(/const\s+handleDragEnd\s*=\s*\(/, "const handleDragEnd = async (");
  }

  if (fnBody.includes("persistWorkboardMove(")) {
    return code.slice(0, match.index) + fnHeader + fnBody + code.slice(end);
  }

  const persistBlock = `
  try {
    const __persistId =
      typeof activeId !== "undefined" ? String(activeId) :
      typeof taskId !== "undefined" ? String(taskId) :
      typeof movedId !== "undefined" ? String(movedId) :
      typeof active !== "undefined" && active?.id ? String(active.id) :
      null;

    const __persistStatus =
      typeof newStatus !== "undefined" ? String(newStatus) :
      typeof nextStatus !== "undefined" ? String(nextStatus) :
      typeof toStatus !== "undefined" ? String(toStatus) :
      typeof targetStatus !== "undefined" ? String(targetStatus) :
      typeof over !== "undefined" && over?.id ? String(over.id) :
      null;

    const __persistPosition =
      typeof newIndex !== "undefined" ? Number(newIndex) :
      typeof targetIndex !== "undefined" ? Number(targetIndex) :
      typeof overIndex !== "undefined" ? Number(overIndex) :
      undefined;

    if (__persistId && __persistStatus) {
      await persistWorkboardMove(__persistId, __persistStatus, __persistPosition);
    }
  } catch (error) {
    console.error(error);
  }
`;

  fnBody = fnBody + "\n" + persistBlock + "\n";
  return code.slice(0, match.index) + fnHeader + fnBody + code.slice(end);
}

src = patchHandleDragEnd(src);
fs.writeFileSync(uiFile, src);

console.log(JSON.stringify({
  schemaPath,
  modelName,
  statusField,
  orderField,
  idType,
  prismaImportPath,
  uiFile: path.relative(root, uiFile),
  routeFile: "app/api/workboard/[id]/route.ts"
}, null, 2));
