import { spawn } from "node:child_process";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npm run preview:page -- src/content/1-news/1/1-post-1.json');
  process.exit(1);
}

await runNodeScript(["scripts/builders/build.js", "--page", ...args]);
await runNodeScript(["scripts/builders/serve.js", "--page", ...args]);

function runNodeScript(scriptArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, scriptArgs, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed (${code}): node ${scriptArgs.join(" ")}`));
    });
    child.on("error", reject);
  });
}
