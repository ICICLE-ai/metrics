import { Octokit } from "https://esm.sh/octokit?dts";
import { GitHubRepo, PyPIProject } from "./model.ts";

// Fetch metrics from github api
export async function fetchGitHubMetrics(
  octokit: Octokit,
  repo: GitHubRepo,
) {
  // Clones
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
      repo.clone_count += response.data.count;
      repo.unique_clone_count += response.data.uniques;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  
  // Page Views
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
      repo.page_view_count += response.data.count;
      repo.unique_page_view_count += response.data.uniques;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

export async function fetchPyPIMetrics(project: PyPIProject, token: string) {
  // Total Downloads
  await fetch(`https://api.pepy.tech/api/v2/projects/${project.name}`, {
    headers: {
      "X-Api-Key": token,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok!");
      }
      return response.json();
    })
    .then((data) => {
        project.download_count += data.total_downloads;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
