import json

with open("githubRepos.json", "rb") as f:
    gh = json.load(f)

with open("pypiProjects.json", "rb") as f:
    pypi = json.load(f)

gh_query = "insert into github_repository (name, link, github_account_name, clone_count, page_view_count, unique_clone_count, unique_page_view_count) values ('%s', '%s', '%s', %d, %d, %d, %d);\n"

pypi_query = "insert into pypi_package (name, link, download_count) values ('%s', '%s', %d);\n"

with open("../sqlite/insert-github-repository.sql", "wb") as f:
    for owner,repos in gh['owners'].items():
        for repo, values in repos.items():
            cl_count = values['clones']['count']
            cl_unique = values['clones']['uniques']
            pv_count = values['page_views']['count']
            pv_unique = values['page_views']['uniques']
            f.write((gh_query%(repo, f"https://github.com/{owner}/{repo}", owner, cl_count, pv_count, cl_unique, pv_unique)).encode())

with open("../sqlite/insert-pypi-package.sql", "wb") as f:
    for proj, values in pypi.items():
        f.write((pypi_query%(proj, f"https://pypi.org/project/{proj}", values['total_downloads'])).encode())
