export {};
interface Config {
  owner?: string;
  repo?: string;
  token?: string;
  head?: string;
  base?: string;
  endpoint?: string;
}
export interface PullRequest {
  title: string;
  body: string;
}
export default class GithubClient {
  private owner;
  private repo;
  private token;
  private head;
  private base;
  private endpoint;
  constructor(config: Config);
  private pullRequestEndpoint;
  private headers;
  private get;
  private post;
  private patch;
  prepareReleasePR(): Promise<any>;
  getPRCommits(pr: any): any;
  collectReleasePRs(releasePR: any): Promise<any>;
  assignReviewers(pr: any, prs: any): Promise<any>;
  updatePR(pr: any, data: any): Promise<PullRequest>;
}
