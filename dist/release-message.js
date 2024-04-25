"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const mustache_1 = require("mustache");
const moment_1 = __importDefault(require("moment"));
function releaseMessage(template, prs) {
  let version = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
  prs.some(function (pr) {
    const m = pr.title.match(/Bump to (.*)/i);
    if (m) {
      version = m[1];
      return true;
    }
  });
  const text = (0, mustache_1.render)(template, { version: version, prs: prs });
  const lines = text.split("\n");
  const title = lines[0];
  const body = lines.slice(1);
  return {
    title: title,
    body: body.join("\n"),
  };
}
exports.default = releaseMessage;
