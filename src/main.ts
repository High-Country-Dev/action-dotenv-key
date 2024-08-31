import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

import * as github from "@actions/github";
  
async function main(): Promise<void> {
  // Check if DOTENV_ME is defined
  if (!process.env.DOTENV_ME) {
    throw new Error("DOTENV_ME is not defined. Please set this environment variable.");
  }

  const context = github.context
  const branch = context.payload.base_ref
    ? path.basename(context.payload.base_ref)
    : path.basename(context.ref)
  const runExec = promisify(exec)  

  if (branch === 'main' || branch === 'master') {
    const { stdout: prodKey } = await runExec(`npx dotenv-vault keys production`)
    await runExec(`echo "DOTENV_KEY=${prodKey}" >> "$GITHUB_ENV"`)
  }
  else if (branch === 'staging') {
    const { stdout: stagingKey } = await runExec(`npx dotenv-vault keys staging`)
    await runExec(`echo "DOTENV_KEY=${stagingKey}" >> "$GITHUB_ENV"`)
  } else {
    const { stdout: devKey } = await runExec(`npx dotenv-vault keys development`)
    await runExec(`echo "DOTENV_KEY=${devKey}" >> "$GITHUB_ENV"`)    
  }
}
main()