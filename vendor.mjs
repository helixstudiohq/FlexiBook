/*
 * FlexiBook offline dependency vendoring toolkit.
 * Phases (idempotent, resumable):
 *   node vendor.mjs enumerate  — resolve the full dependency tree
 *   node vendor.mjs download   — fetch all tarballs with resume + retries
 *   node vendor.mjs extract    — extract tarballs into node_modules/
 *   node vendor.mjs shims      — create node_modules/.bin shims
 * Works around flaky networks that break `npm install`.
 */
import fs from "fs";
import path from "path";
import https from "https";
import { execFileSync } from "child_process";

const REG = "https://registry.npmjs.org";
const VENDOR = "vendor";
const TARBALLS = path.join(VENDOR, "tarballs");
const PLAN = path.join(VENDOR, "plan.json");
const NM = "node_modules";

const ROOT_DEPS = {
  next: "14.2.15",
  react: "18.3.1",
  "react-dom": "18.3.1",
  "@next/swc-win32-x64-msvc": "14.2.15",
  "@supabase/supabase-js": "2.45.4",
  "framer-motion": "11.11.7",
  "lucide-react": "0.446.0",
  tailwindcss: "3.4.13",
  postcss: "8.4.47",
  autoprefixer: "10.4.20",
  typescript: "5.6.3",
  "@types/node": "20.16.11",
  "@types/react": "18.3.11",
  "@types/react-dom": "18.3.0",
};

/* ── tiny semver ─────────────────────────────────────────────────── */

function parseVer(v) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(v);
  if (!m) return null;
  return {
    major: +m[1],
    minor: +m[2],
    patch: +m[3],
    pre: m[4] ? m[4].split(".") : null,
    raw: v,
  };
}

function cmpPre(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i], y = b[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    if (xn && yn) { const d = +x - +y; if (d) return d; }
    else if (xn) return -1;
    else if (yn) return 1;
    else if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

function cmp(a, b) {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch || cmpPre(a.pre, b.pre);
}

function satComparator(v, c) {
  const m = /^(\^|~|>=|<=|>|<|=)?\s*v?(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(?:-([0-9A-Za-z.-]+))?$/.exec(c.trim());
  if (!m) return true; // unknown comparator — be permissive
  const op = m[1] || "";
  const maj = m[2], min = m[3], pat = m[4];
  if (maj === "*" || maj === "x" || maj === undefined) return !v.pre;
  const M = +maj;
  const mi = min === undefined || min === "x" || min === "*" ? null : +min;
  const pa = pat === undefined || pat === "x" || pat === "*" ? null : +pat;
  const pv = parseVer(v.raw);
  if (!pv) return false;
  const hasPreIn = Boolean(m[5]);
  if (pv.pre && !hasPreIn) {
    // allow prerelease only when range itself is a prerelease
    return false;
  }
  const base = { major: M, minor: mi ?? 0, patch: pa ?? 0, pre: m[5] ? m[5].split(".") : null, raw: "" };
  if (op === "^") {
    if (cmp(pv, base) < 0) return false;
    if (M > 0) return pv.major === M;
    if (mi !== null && mi > 0) return pv.major === 0 && pv.minor === mi;
    if (pa !== null) return pv.major === 0 && pv.minor === 0 && pv.patch === pa;
    return true;
  }
  if (op === "~") {
    if (cmp(pv, base) < 0) return false;
    return mi === null ? pv.major === M : pv.major === M && pv.minor === mi;
  }
  if (op === ">=") return cmp(pv, base) >= 0;
  if (op === "<=") return cmp(pv, base) <= 0;
  if (op === ">") return cmp(pv, base) > 0;
  if (op === "<") return cmp(pv, base) < 0;
  // exact
  return M === pv.major && (mi === null || mi === pv.minor) && (pa === null || pa === pv.patch) && (!m[5] || (pv.pre && pv.pre.join(".") === m[5]));
}

function satisfies(version, range) {
  if (!range || range === "*" || range === "latest" || range === "x") return true;
  const norm = range.replace(/(>=|<=|>|<|\^|~|=)\s+/g, "$1");
  return norm.split("||").some((clause) =>
    clause.trim().split(/\s+/).every((c) => c === "" || satComparator(version, c)),
  );
}

/* ── registry fetch with retries ─────────────────────────────────── */

function fetchWithRetry(url, { accept, attempts = 6, timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const tryOnce = (n) => {
      const req = https.get(
        url,
        { headers: accept ? { Accept: accept } : {}, timeout: timeoutMs },
        (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            return retryOrBoom(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
          const chunks = [];
          let stall = setTimeout(() => req.destroy(new Error("stall")), timeoutMs);
          res.on("data", (c) => { chunks.push(c); clearTimeout(stall); stall = setTimeout(() => req.destroy(new Error("stall")), timeoutMs); });
          res.on("end", () => { clearTimeout(stall); resolve(Buffer.concat(chunks)); });
          res.on("error", (e) => retryOrBoom(e));
        },
      );
      req.on("timeout", () => req.destroy(new Error("timeout")));
      req.on("error", (e) => retryOrBoom(e));
      function retryOrBoom(err) {
        if (n < attempts) {
          console.log(`  retry ${n + 1}/${attempts} for ${url} (${err.message})`);
          setTimeout(() => tryOnce(n + 1), 800 + n * 700);
        } else reject(err);
      }
    };
    tryOnce(1);
  });
}

const packumentCache = new Map();
async function getPackument(name) {
  if (packumentCache.has(name)) return packumentCache.get(name);
  const url = `${REG}/${encodeURIComponent(name).replace(/^%40/, "@")}`;
  const buf = await fetchWithRetry(url, {
    accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8",
    attempts: 8,
  });
  const doc = JSON.parse(buf.toString("utf8"));
  packumentCache.set(name, doc);
  return doc;
}

function pickVersion(doc, range) {
  const versions = Object.values(doc.versions || {}).filter((v) => {
    const p = parseVer(v.version);
    if (!p) return false;
    if (p.pre && !/-/.test(range)) return false; // skip prereleases for stable ranges
    if (v.os && !v.os.some((o) => o === "win32" || o === "!win32" ? o === "win32" : false)) {
      if (v.os.includes("win32") === false && !v.os.some((o) => o.startsWith("!"))) return false;
    }
    if (v.cpu && !v.cpu.some((c) => c === "x64" || c.startsWith("!"))) return false;
    return true;
  });
  const ok = versions.filter((v) => satisfies(parseVer(v.version), range));
  if (ok.length === 0) {
    if (range === "latest" || range === "*") {
      const latest = doc["dist-tags"]?.latest;
      if (latest && doc.versions[latest]) return doc.versions[latest];
    }
    return null;
  }
  ok.sort((a, b) => cmp(parseVer(b.version), parseVer(a.version)));
  return ok[0];
}

/* ── enumerate phase ─────────────────────────────────────────────── */

function slotExists(baseDir, name) {
  return fs.existsSync(path.join(baseDir, NM, name, "package.json"));
}
function slotVersion(baseDir, name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(baseDir, NM, name, "package.json"), "utf8")).version;
  } catch {
    return null;
  }
}

async function enumerate() {
  fs.mkdirSync(VENDOR, { recursive: true });
  const plan = [];
  const placed = new Map(); // installDir -> Map(name -> version)
  const seen = new Set(); // name@version@dir dedupe
  const queue = [];

  for (const [name, range] of Object.entries(ROOT_DEPS)) {
    queue.push({ name, range, requester: "" });
  }

  let processed = 0;
  while (queue.length > 0) {
    const { name, range, requester } = queue.shift();
    const key = `${name}@${range}@${requester}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const doc = await getPackument(name);
    const ver = pickVersion(doc, range);
    if (!ver) {
      console.error(`  !! no version of ${name} satisfies ${range}`);
      continue;
    }

    // Find install location following npm lookup rules (simplified):
    let installDir = requester; // nested under requester by default
    const rootSlot = path.join("", NM, name);
    const rootVer = slotVersion("", name);
    if (rootVer && satisfies(parseVer(rootVer), range)) {
      installDir = ""; // reuse hoisted root
    } else if (!rootVer) {
      installDir = ""; // hoist to root
    } else if (slotExists(requester, name)) {
      const nestedVer = slotVersion(requester, name);
      if (nestedVer && satisfies(parseVer(nestedVer), range)) installDir = requester;
    }

    const mapKey = path.join(installDir, NM, name);
    const already = plan.find((p) => p.installDir === installDir && p.name === name);
    if (already) {
      if (!satisfies(parseVer(already.version), range)) {
        // conflict: nest a second copy under requester
        const nestDir = path.join(requester, NM, name);
        const existNest = plan.find((p) => p.installDir === requester && p.name === name);
        if (!existNest) {
          plan.push({ name, version: ver.version, tarball: ver.dist.tarball, installDir: requester, deps: [] });
        }
      }
      continue;
    }

    plan.push({
      name,
      version: ver.version,
      tarball: ver.dist.tarball,
      installDir,
    });
    processed++;
    if (processed % 25 === 0) console.log(`  … ${processed} packages resolved`);

    // queue dependencies
    const depFields = ["dependencies", "optionalDependencies"];
    for (const field of depFields) {
      const deps = ver[field];
      if (!deps) continue;
      for (const [dn, dr] of Object.entries(deps)) {
        if (dn === "@next/swc" || dn.startsWith("@next/swc-")) {
          // only the exact platform binary for the root next
          if (!dn.includes("win32-x64-msvc")) continue;
        }
        queue.push({ name: dn, range: dr, requester: mapKey });
      }
    }
  }

  // dedupe identical install slots (same name+dir keep first)
  const finalPlan = [];
  const slotSeen = new Set();
  for (const p of plan) {
    const k = `${p.installDir}::${p.name}`;
    if (slotSeen.has(k)) continue;
    slotSeen.add(k);
    finalPlan.push(p);
  }

  fs.writeFileSync(PLAN, JSON.stringify(finalPlan, null, 2));
  console.log(`Enumerated ${finalPlan.length} packages → ${PLAN}`);
}

/* ── download phase ──────────────────────────────────────────────── */

function downloadOne(entry, attempts = 12) {
  const fname = entry.tarball.split("/").pop();
  const out = path.join(TARBALLS, fname);
  fs.mkdirSync(TARBALLS, { recursive: true });

  for (let i = 1; i <= attempts; i++) {
    try {
      execFileSync("curl", [
        "-fL", "--silent", "--show-error",
        "-C", "-",
        "--connect-timeout", "12",
        "--speed-time", "20", "--speed-limit", "1024",
        "--retry", "2", "--retry-delay", "1",
        "-o", out,
        entry.tarball,
      ], { stdio: ["ignore", "ignore", "pipe"], timeout: 180000 });
      const size = fs.statSync(out).size;
      if (size > 0) return { out, ok: true };
    } catch (e) {
      if (i === attempts) return { out, ok: false, err: String(e.stderr || e.message) };
      // brief pause; resume continues from partial data next round
    }
  }
  return { out, ok: false, err: "exhausted attempts" };
}

async function download() {
  const plan = JSON.parse(fs.readFileSync(PLAN, "utf8"));
  console.log(`Downloading ${plan.length} tarballs (resumable)…`);
  const failures = [];
  let done = 0;

  async function worker(entries) {
    for (const entry of entries) {
      const fname = entry.tarball.split("/").pop();
      const res = downloadOne(entry);
      done++;
      if (!res.ok) {
        failures.push({ name: entry.name, err: res.err });
        console.log(`  FAIL ${entry.name} (${fname})`);
      } else if (done % 20 === 0) {
        console.log(`  ${done}/${plan.length}`);
      }
    }
  }

  const concurrency = 4;
  const buckets = Array.from({ length: concurrency }, () => []);
  plan.forEach((entry, i) => buckets[i % concurrency].push(entry));
  await Promise.all(buckets.map((b) => worker(b)));

  if (failures.length > 0) {
    console.error(`\n${failures.length} downloads failed — rerun "node vendor.mjs download" to resume.`);
    process.exitCode = 1;
  } else {
    console.log(`All ${plan.length} tarballs downloaded.`);
  }
}

/* ── extract phase ───────────────────────────────────────────────── */

function extract() {
  const plan = JSON.parse(fs.readFileSync(PLAN, "utf8"));
  let ok = 0, missing = 0;
  for (const p of plan) {
    const fname = p.tarball.split("/").pop();
    const tgz = path.join(TARBALLS, fname);
    if (!fs.existsSync(tgz) || fs.statSync(tgz).size === 0) {
      console.error(`  missing tarball: ${p.name}@${p.version}`);
      missing++;
      continue;
    }
    const dest = path.join(p.installDir || ".", NM, p.name).split(path.sep).join("/");
    const tgzFwd = tgz.split(path.sep).join("/");
    fs.mkdirSync(dest, { recursive: true });
    try {
      execFileSync("tar", ["-xzf", tgzFwd, "--strip-components=1", "-C", dest], { stdio: ["ignore", "ignore", "pipe"] });
      ok++;
    } catch (e) {
      console.error(`  extract failed ${p.name}: ${String(e.stderr || e.message).slice(0, 120)}`);
      missing++;
    }
  }
  console.log(`Extracted ${ok} packages (${missing} problems).`);
  if (missing > 0) process.exitCode = 1;
}

/* ── shims phase ─────────────────────────────────────────────────── */

function shims() {
  const binDir = path.join(NM, ".bin");
  fs.mkdirSync(binDir, { recursive: true });
  let made = 0;

  function walk(dir) {
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.name === "node_modules" && dir !== NM) continue;
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name === "package.json") {
        let pkg;
        try { pkg = JSON.parse(fs.readFileSync(p, "utf8")); } catch { continue; }
        if (!pkg.bin) continue;
        const bins = typeof pkg.bin === "string" ? { [pkg.name.split("/").pop()]: pkg.bin } : pkg.bin;
        for (const [binName, rel] of Object.entries(bins)) {
          const targetAbs = path.relative(binDir, path.join(path.dirname(p), rel)).split(path.sep).join("/");
          const sh = `#!/bin/sh\nbasedir=$(dirname "$0")\nexec node "$basedir/${targetAbs}" "$@"\n`;
          fs.writeFileSync(path.join(binDir, binName), sh.replace(/\\/g, "/"), { mode: 0o755 });
          const cmd = `@node "%~dp0\\${targetAbs.replace(/\//g, "\\")}" %*\n`;
          fs.writeFileSync(path.join(binDir, binName + ".cmd"), cmd);
          made++;
        }
      }
    }
  }
  walk(NM);
  console.log(`Created ${made} bin shims in ${binDir}`);
}

/* ── main ────────────────────────────────────────────────────────── */

const phase = process.argv[2];
if (phase === "enumerate") await enumerate();
else if (phase === "download") await download();
else if (phase === "extract") extract();
else if (phase === "shims") shims();
else {
  console.log("usage: node vendor.mjs <enumerate|download|extract|shims>");
}
