import { App, Octokit } from "https://esm.sh/octokit?dts";
import { Database, Statement } from "jsr:@db/sqlite@0.11";
import { load } from "@std/dotenv";

// Fetch metrics from github api
async function fetchGitHubMetrics(octokit: Octokit, repo) {
  await octokit
    .request("GET /repos/{owner}/{repo}/traffic/{metric}", {
      owner: repo.github_account_name,
      repo: repo.name,
      metric: "clones",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((response) => {
      if (response.status === 403) {
        throw new Error("Forbidden!");
      }
      console.log(response.data);
      repo.clone_count += response.data.count;
      repo.unique_clone_count += response.data.uniques;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  await octokit
    .request("GET /repos/{owner}/{repo}/traffic/{metric}", {
      owner: repo.github_account_name,
      repo: repo.name,
      metric: "views",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((response) => {
      if (response.status === 403) {
        throw new Error("Forbidden!");
      }
      // console.log(response.data.count);
      repo.page_view_count += response.data.count;
      repo.unique_page_view_count += response.data.uniques;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Update database
function updateGitHubMetrics(db: Database) {
  // Fetch all github accounts
  const accounts = db.prepare("SELECT * FROM github_account").all(1);
  // Fetch metrics for all accounts
  // for (const account of accounts) {
  Promise.all(accounts.map((account) => {
    if (account.name === "icicle-ai") {
      // Intialize Octokit to call GitHub APIs
      const octokit = new Octokit({
        auth: Deno.env.get(account.token),
      });
      // Fetch all repositories for the account
      const repos = db.prepare(
        "SELECT * FROM github_repository WHERE github_account_name = :github_account_name",
      ).all({ github_account_name: account.name });
      Promise.all(repos.map(async (repo) => {
        if (repo.name === "Smartfoodshed_VA_VC1") {
          console.log(repo);
          await fetchGitHubMetrics(octokit, repo);
          console.log(repo);
        }
      }));
    }
  }));
}

if (import.meta.main) {
  await load({ export: true });
  const db = new Database("./sqlite/icicle_metrics.db");
  updateGitHubMetrics(db);
  db.close();
}
