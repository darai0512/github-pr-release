"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
const parse_link_header_1 = __importDefault(require("parse-link-header"));
class GithubClient {
  constructor(config) {
    this.owner = config.owner || process.env.GITHUB_PR_RELEASE_OWNER;
    this.repo = config.repo || process.env.GITHUB_PR_RELEASE_REPO;
    this.token = config.token || process.env.GITHUB_PR_RELEASE_TOKEN;
    this.head = config.head || process.env.GITHUB_PR_RELEASE_HEAD || "master";
    this.base =
      config.base || process.env.GITHUB_PR_RELEASE_BASE || "production";
    this.endpoint =
      config.endpoint ||
      process.env.GITHUB_PR_RELEASE_ENDPOINT ||
      "https://api.github.com";
  }
  pullRequestEndpoint() {
    return this.endpoint + "/repos/" + this.owner + "/" + this.repo + "/pulls";
  }
  headers() {
    return {
      Authorization: "token " + this.token,
      "User-Agent": "uiur/github-pr-release",
    };
  }
  get(url, query) {
    query = query || {};
    return new Promise((resolve, reject) => {
      request_1.default.get(
        {
          url: url,
          qs: query,
          headers: this.headers(),
          json: true,
        },
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });
  }
  post(url, body) {
    body = body || {};
    return new Promise((resolve, reject) => {
      request_1.default.post(
        {
          url: url,
          body: body,
          json: true,
          headers: this.headers(),
        },
        function (err, res, body) {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });
  }
  patch(url, body) {
    body = body || {};
    return new Promise((resolve, reject) => {
      request_1.default.patch(
        {
          url: url,
          body: body,
          json: true,
          headers: this.headers(),
        },
        function (err, res, body) {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });
  }
  prepareReleasePR() {
    return __awaiter(this, void 0, void 0, function* () {
      const res = yield this.post(this.pullRequestEndpoint(), {
        title: "Preparing release pull request...",
        head: this.head,
        base: this.base,
      });
      if (res.statusCode === 201) {
        return res.body;
      } else if (res.statusCode === 422) {
        const errMessage = res.body.errors[0].message;
        if (!errMessage.match(/pull request already exists/)) {
          return Promise.reject(new Error(errMessage));
        }
        const res2 = yield this.get(this.pullRequestEndpoint(), {
          base: this.base,
          head: this.head,
          state: "open",
        });
        return res2.body[0];
      } else {
        return Promise.reject(new Error(res.body.message));
      }
    });
  }
  getPRCommits(pr) {
    let result = [];
    const getCommits = (page) => {
      page = page || 1;
      return this.get(
        this.pullRequestEndpoint() + "/" + pr.number + "/commits",
        {
          per_page: 100,
          page: page,
        }
      ).then(function (res) {
        const commits = res.body;
        result = result.concat(commits);
        const link = (0, parse_link_header_1.default)(res.headers.link);
        if (link && link.next) {
          return getCommits(page + 1);
        } else {
          return result;
        }
      });
    };
    return getCommits(null).catch(console.error.bind(console));
  }
  collectReleasePRs(releasePR) {
    return __awaiter(this, void 0, void 0, function* () {
      const commits = yield this.getPRCommits(releasePR);
      const shas = commits.map((commit) => commit.sha);
      return yield this.get(this.pullRequestEndpoint(), {
        state: "closed",
        base: this.head.split(":").at(-1),
        per_page: 100,
        sort: "updated",
        direction: "desc",
      }).then(function (res) {
        const prs = res.body;
        const mergedPRs = prs.filter(function (pr) {
          return pr.merged_at !== null;
        });
        const prsToRelease = mergedPRs.reduce(function (result, pr) {
          if (
            shas.indexOf(pr.head.sha) > -1 ||
            shas.indexOf(pr.merge_commit_sha) > -1
          ) {
            result.push(pr);
          }
          return result;
        }, []);
        prsToRelease.sort(function (a, b) {
          return Number(new Date(a.merged_at)) - Number(new Date(b.merged_at));
        });
        return prsToRelease;
      });
    });
  }
  assignReviewers(pr, prs) {
    const reviewers = prs
      .map((pr) => (pr.assignee ? pr.assignee : pr.user))
      .filter((user) => user.type === "User")
      .map((user) => user.login);
    return this.post(
      this.pullRequestEndpoint() + "/" + pr.number + "/requested_reviewers",
      { reviewers }
    ).then(function (res) {
      return res.body;
    });
  }
  updatePR(pr, data) {
    return this.patch(this.pullRequestEndpoint() + "/" + pr.number, data).then(
      (res) => res.body
    );
  }
}
exports.default = GithubClient;
