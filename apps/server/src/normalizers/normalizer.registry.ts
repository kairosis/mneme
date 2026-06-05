import { normalizeSlackMessage, normalizeSlackReaction, normalizeSlackChannelJoined } from './slack.normalizer';
import { normalizeGithubCommitPushed, normalizeGithubPrOpened, normalizeGithubPrMerged, normalizeGithubPrClosed, normalizeGithubIssueOpened, normalizeGithubIssueClosed } from './github.normalizer';
import { normalizeEmailReceived, normalizeEmailSent, normalizeEmailRead } from './email.normalizer';
import { normalizeTrackStarted, normalizeTrackCompleted, normalizeTrackSaved, normalizeArtistPlayed, normalizePlaylistStarted, normalizePodcastStarted, normalizePodcastCompleted, normalizeSessionEnded } from './spotify.normalizer';
import { normalizeCalendarEventCreated, normalizeCalendarEventUpdated, normalizeCalendarEventDeleted } from './google-calendar.normalizer';
import { normalizeBrowserPageVisited, normalizeBrowserTabActivated, normalizeBrowserTabOpened, normalizeBrowserTabClosed } from './browser.normalizer';
import { normalizeAppActivated, normalizeScreenLocked, normalizeScreenUnlocked, normalizeIdleStarted, normalizeIdleEnded, normalizeBatteryChanged } from './desktop.normalizer';
import { normalizeCommandExecuted, normalizeDirectoryChanged } from './terminal.normalizer';

export type NormalizerFn = (payload: unknown) => string;

export const NormalizerRegistry: Record<string, NormalizerFn> = {
  // Slack
  'slack.message.received':   normalizeSlackMessage as NormalizerFn,
  'slack.reaction.added':     normalizeSlackReaction as NormalizerFn,
  'slack.channel.joined':     normalizeSlackChannelJoined as NormalizerFn,

  // GitHub
  'github.commit.pushed':     normalizeGithubCommitPushed as NormalizerFn,
  'github.pr.opened':         normalizeGithubPrOpened as NormalizerFn,
  'github.pr.merged':         normalizeGithubPrMerged as NormalizerFn,
  'github.pr.closed':         normalizeGithubPrClosed as NormalizerFn,
  'github.issue.opened':      normalizeGithubIssueOpened as NormalizerFn,
  'github.issue.closed':      normalizeGithubIssueClosed as NormalizerFn,

  // Email (IMAP)
  'email.received':           normalizeEmailReceived as NormalizerFn,
  'email.sent':               normalizeEmailSent as NormalizerFn,
  'email.read':               normalizeEmailRead as NormalizerFn,

  // Spotify
  'spotify.track.started':            normalizeTrackStarted as NormalizerFn,
  'spotify.track.completed':          normalizeTrackCompleted as NormalizerFn,
  'spotify.track.saved':              normalizeTrackSaved as NormalizerFn,
  'spotify.artist.played':            normalizeArtistPlayed as NormalizerFn,
  'spotify.playlist.started':         normalizePlaylistStarted as NormalizerFn,
  'spotify.podcast.episode.started':  normalizePodcastStarted as NormalizerFn,
  'spotify.podcast.episode.completed':normalizePodcastCompleted as NormalizerFn,
  'spotify.listening.session.ended':  normalizeSessionEnded as NormalizerFn,

  // Google Calendar
  'calendar.event.created':   normalizeCalendarEventCreated as NormalizerFn,
  'calendar.event.updated':   normalizeCalendarEventUpdated as NormalizerFn,
  'calendar.event.deleted':   normalizeCalendarEventDeleted as NormalizerFn,

  // Browser
  'browser.page.visited':     normalizeBrowserPageVisited as NormalizerFn,
  'browser.tab.activated':    normalizeBrowserTabActivated as NormalizerFn,
  'browser.tab.opened':       normalizeBrowserTabOpened as NormalizerFn,
  'browser.tab.closed':       normalizeBrowserTabClosed as NormalizerFn,

  // Desktop
  'desktop.app.activated':    normalizeAppActivated as NormalizerFn,
  'desktop.screen.locked':    normalizeScreenLocked as NormalizerFn,
  'desktop.screen.unlocked':  normalizeScreenUnlocked as NormalizerFn,
  'desktop.idle.started':     normalizeIdleStarted as NormalizerFn,
  'desktop.idle.ended':       normalizeIdleEnded as NormalizerFn,
  'desktop.battery.changed':  normalizeBatteryChanged as NormalizerFn,

  // Terminal
  'terminal.command.executed':  normalizeCommandExecuted as NormalizerFn,
  'terminal.directory.changed': normalizeDirectoryChanged as NormalizerFn,
};
