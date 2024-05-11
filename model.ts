// deno-lint-ignore-file no-explicit-any
export interface GitHubRepo extends Record<string, any> {
  name: string,
  link: string,
  github_account_name: string,
  clone_count: number,
  page_view_count: number,
  unique_clone_count: number,
  unique_page_view_count: number,
  release_download_count: number,
}

export interface PyPIProject extends Record<string, any>{
  name: string,
  link: string,
  download_count: number,
}
