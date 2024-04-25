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
const github_client_1 = __importDefault(require("./github-client"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const release_message_1 = __importDefault(require("./release-message"));
function createReleasePR(config) {
  return __awaiter(this, void 0, void 0, function* () {
    const client = config.githubClient || new github_client_1.default(config);
    const releasePR = yield client.prepareReleasePR();
    const prs = yield client.collectReleasePRs(releasePR);
    const templatePath =
      config.template || path_1.default.join(__dirname, "release.mustache");
    const template = fs_1.default.readFileSync(templatePath, "utf8");
    const message = (0, release_message_1.default)(template, prs);
    client.assignReviewers(releasePR, prs);
    return client.updatePR(releasePR, message);
  });
}
exports.default = createReleasePR;
module.exports = createReleasePR;
