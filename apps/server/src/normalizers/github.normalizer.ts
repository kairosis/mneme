interface GithubCommitPayload {
  repository: string;
  branch: string;
  commitSha: string;
  message: string;
  authorName: string;
  url: string;
}

interface GithubPrPayload {
  repository: string;
  prNumber: number;
  title: string;
  authorName: string;
  headBranch: string;
  baseBranch: string;
  url: string;
  mergedBy?: string;
  body?: string;
  draft?: boolean;
}

interface GithubIssuePayload {
  repository: string;
  issueNumber: number;
  title: string;
  authorName: string;
  state: string;
  url: string;
  body?: string;
}

export const normalizeGithubCommitPushed = (payload: GithubCommitPayload): string =>
  `${payload.authorName} pushed a commit to ${payload.repository}/${payload.branch}: "${payload.message.split('\n')[0]}"`;

export const normalizeGithubPrOpened = (payload: GithubPrPayload): string =>
  `${payload.authorName} opened PR #${payload.prNumber} on ${payload.repository}: "${payload.title}"${payload.draft ? ' [draft]' : ''}`;

export const normalizeGithubPrMerged = (payload: GithubPrPayload): string =>
  `${payload.mergedBy ?? payload.authorName} merged PR #${payload.prNumber} on ${payload.repository}: "${payload.title}"`;

export const normalizeGithubPrClosed = (payload: GithubPrPayload): string =>
  `PR #${payload.prNumber} closed on ${payload.repository}: "${payload.title}"`;

export const normalizeGithubIssueOpened = (payload: GithubIssuePayload): string =>
  `${payload.authorName} opened issue #${payload.issueNumber} on ${payload.repository}: "${payload.title}"`;

export const normalizeGithubIssueClosed = (payload: GithubIssuePayload): string =>
  `Issue #${payload.issueNumber} closed on ${payload.repository}: "${payload.title}"`;
