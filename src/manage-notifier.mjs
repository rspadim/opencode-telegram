import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const PID_PATH = path.join(DATA_DIR, "telegram-notifier.pid");
const LOCK_PATH = path.join(DATA_DIR, "telegram-notifier.lock");

const command = process.argv[2] || "status";

if (command === "stop") {
  await stopNotifier();
  process.exit(0);
}

if (command === "status") {
  await printStatus();
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
process.exit(1);

async function stopNotifier() {
  const pid = await readPid(PID_PATH);
  if (!pid) {
    console.log("telegram-notifier not running");
    return;
  }

  if (!isProcessAlive(pid)) {
    await cleanupFiles();
    console.log(`telegram-notifier stale PID cleaned (${pid})`);
    return;
  }

  process.kill(pid, "SIGTERM");
  console.log(`telegram-notifier stop requested (${pid})`);
}

async function printStatus() {
  const pid = await readPid(PID_PATH);
  const lockPid = await readPid(LOCK_PATH);
  const running = pid ? isProcessAlive(pid) : false;
  console.log(
    JSON.stringify(
      {
        running,
        pid,
        lockPid,
        pidFile: PID_PATH,
        lockFile: LOCK_PATH,
      },
      null,
      2
    )
  );
}

async function cleanupFiles() {
  await fs.unlink(PID_PATH).catch(() => {});
  await fs.unlink(LOCK_PATH).catch(() => {});
}

async function readPid(filePath) {
  try {
    const raw = (await fs.readFile(filePath, "utf8")).trim();
    const pid = Number(raw);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
