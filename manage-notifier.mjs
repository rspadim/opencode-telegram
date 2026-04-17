import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const child = spawn(
  process.execPath,
  [
    "--import",
    "tsx",
    path.join(__dirname, "src", "manage-notifier.ts"),
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
    cwd: __dirname,
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
