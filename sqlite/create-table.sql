CREATE TABLE github_account (
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (name)
);

CREATE TABLE github_repository (
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  github_account_name TEXT NOT NULL,
  clone_count INTEGER DEFAULT 0,
  page_view_count INTEGER DEFAULT 0,
  unique_clone_count INTEGER DEFAULT 0,
  unique_page_view_count INTEGER DEFAULT 0,
  release_download_count INTEGER DEFAULT 0,
  PRIMARY KEY (name),
  FOREIGN KEY (github_account_name) REFERENCES github_account(name)
);

CREATE TABLE pypi_project (
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  PRIMARY KEY (name)
);
