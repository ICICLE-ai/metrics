import { assertEquals } from "jsr:@std/assert";
import { fetchGitHubMetrics, fetchPyPIMetrics } from "./metrics.ts";
import { Octokit } from "https://esm.sh/octokit?dts";
import { load } from "@std/dotenv";
import { GitHubRepo, PyPIProject } from "./helper_functions.ts";
const env = await load({ export: true });

const octokit = new Octokit({
  auth: env["ICICLE_GITHUB_TOKEN"],
});
const test_repo: string = "Smartfoodshed_VA_VC1";
const repo: GitHubRepo = {
  name: "Smartfoodshed_VA_VC1",
  link: "https://github.com/icicle-ai/Smartfoodshed_VA_VC1",
  github_account_name: "icicle-ai",
  clone_count: 486,
  page_view_count: 3798,
  unique_clone_count: 187,
  unique_page_view_count: 145,
  release_download_count: 0,
};
Deno.test(
  "test fetchGitHubMetrics",
  async () => {
    const test_clones = {
      count: repo.clone_count,
      unique: repo.unique_clone_count,
    };
    const test_views = {
      count: repo.page_view_count,
      unique: repo.unique_page_view_count,
    };

    const clones = await octokit
      .request("GET /repos/{owner}/{repo}/traffic/{metric}", {
        owner: "icicle-ai",
        repo: test_repo,
        metric: "clones",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
      .then((response) => {
        if (response.status === 403) {
          throw new Error("Forbidden!");
        }
        return { count: response.data.count, unique: response.data.uniques };
      });

    const views = await octokit
      .request("GET /repos/{owner}/{repo}/traffic/{metric}", {
        owner: "icicle-ai",
        repo: test_repo,
        metric: "views",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
      .then((response) => {
        if (response.status === 403) {
          throw new Error("Forbidden!");
        }
        return { count: response.data.count, unique: response.data.uniques };
      });

    await fetchGitHubMetrics(octokit, repo);

    assertEquals(test_clones.count + clones.count, repo.clone_count);
    assertEquals(test_clones.unique + clones.unique, repo.unique_clone_count);
    assertEquals(test_views.count + views.count, repo.page_view_count);
    assertEquals(
      test_views.unique + views.unique,
      repo.unique_page_view_count,
    );
  },
);

const test_project: string = "iciflaskn";
const project: PyPIProject = {
  name: "iciflaskn",
  link: "https://pypi.org/project/iciflaskn",
  download_count: 0,
};
Deno.test(
  "test fetchPyPIMetrics",
  async () => {
    const test_download_count = project.download_count;
    const token: string = env["PYPI_API_TOKEN"];
    const download_count = await fetch(
      `https://api.pepy.tech/api/v2/projects/${test_project}`,
      {
        headers: {
          "X-Api-Key": token,
        },
      },
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data.total_downloads;
      });

    await fetchPyPIMetrics(project, token);
    assertEquals(test_download_count + download_count, project.download_count);
  },
);
