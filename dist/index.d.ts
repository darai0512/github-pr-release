import GithubClient, { PullRequest } from "./github-client";
interface ReleaseConfig {
  token?: string;
  owner?: string;
  repo?: string;
  head?: string;
  base?: string;
  template?: string;
  githubClient?: GithubClient;
}
export default function createReleasePR(
  config: ReleaseConfig
): Promise<PullRequest>;
export {};
