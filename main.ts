import { Octokit } from "https://esm.sh/octokit?dts";
import { Database } from "jsr:@db/sqlite@0.11";
import { load } from "@std/dotenv";
import { fetchGitHubMetrics, fetchPyPIMetrics } from "./helper_functions.ts";

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

    Promise.all(
      repos.map(async (repo) => {
        // Fetch metrics for all repositories
        await fetchGitHubMetrics(octokit, repo).then(() => {
          console.log(repo);
          // // Update the database
          // db.exec(
          //   `UPDATE github_account SET
          //     clone_count = ?,
          //     page_view_count = ?,
          //     unique_clone_count = ?,
          //     unique_page_view_count = ?,
          //     release_download_count = :release_download_count
          //   WHERE name = ?;`,
          //   repo.clone_count,
          //   repo.page_view_count,
          //   repo.unique_clone_count,
          //   repo.unique_page_view_count,
          //   repo.release_download_count,
          //   repo.name,
          // );
        });
      }),
    );
  }));

  // Fetch all PyPI projects from the database
  const projects = db.prepare("SELECT * FROM pypi_package").all(1);
  const token: string = env["PYPI_API_TOKEN"];

  Promise.all(projects.map(async (project) => {
    // Fetch metrics for all projects
    await fetchPyPIMetrics(project, token).then(() => {
      // // Update the database
      // db.exec(
      //   "UPDATE pypi_package SET download_count = ? WHERE name = ?;",
      //   project.download_count,
      //   project.name,
      // );
    });
  }));

  // TODO: Create RSS 2.0 XML file

  db.close();
}
