import { Octokit } from "https://esm.sh/octokit?dts";
import { Database } from "jsr:@db/sqlite@0.11";
import { load } from "@std/dotenv";
import { fetchGitHubMetrics, fetchPyPIMetrics } from "./metrics.ts";

if (import.meta.main) {
  const env: Record<string, string> = await load({ export: true });
  const db: Database = new Database("./sqlite/icicle_metrics.db");

  // Fetch all github accounts from the database
  const accounts = db.prepare("SELECT * FROM github_account").all(1);

  // Fetch metrics for all repositories in each account
  Promise.all(accounts.map((account) => {
    // Intialize Octokit to call GitHub APIs
    const octokit: Octokit = new Octokit({
      auth: env[account.token],
    });
    
    // Fetch all repositories for the account
    const repos = db.prepare(
      "SELECT * FROM github_repository WHERE github_account_name = :github_account_name",
    ).all({ github_account_name: account.name });

    // Fetch metrics for all repositories
    Promise.all(repos.map(async (repo) => await fetchGitHubMetrics(octokit, repo)));
  }));

  // Fetch all PyPI projects from the database
  const projects = db.prepare("SELECT * FROM pypi_package").all(1);
  const token: string = env["PYPI_API_TOKEN"];
  
  // Fetch metrics for all projects
  Promise.all(projects.map((project) => fetchPyPIMetrics(project, token)));
  
  // TODO: Update the database

  // TODO: Create RSS 2.0 XML file

  db.close();
}
