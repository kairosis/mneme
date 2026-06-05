interface TrackPayload { trackName: string; artist: string; album?: string; durationMs?: number; }
interface TrackCompletedPayload { trackName: string; artist: string; listenedPercent?: number; }
interface ArtistPayload { artistName: string; genres?: string[]; }
interface PlaylistPayload { playlistName: string; owner?: string; trackCount?: number; }
interface PodcastPayload { episodeTitle: string; showName: string; listenedPercent?: number; description?: string; }
interface SessionPayload { durationMinutes: number; trackCount: number; topGenres?: string[]; skippedCount?: number; }
interface TrackSavedPayload { trackName: string; artist: string; }

export const normalizeTrackStarted = (payload: TrackPayload): string =>
  `Started listening to "${payload.trackName}" by ${payload.artist}${payload.album ? ` from album "${payload.album}"` : ''}`;

export const normalizeTrackCompleted = (payload: TrackCompletedPayload): string =>
  `Finished listening to "${payload.trackName}" by ${payload.artist}${payload.listenedPercent !== undefined ? ` (${payload.listenedPercent}%)` : ''}`;

export const normalizeTrackSaved = (payload: TrackSavedPayload): string =>
  `Saved "${payload.trackName}" by ${payload.artist} to library`;

export const normalizeArtistPlayed = (payload: ArtistPayload): string => {
  const genres = payload.genres?.slice(0, 3).join(', ');
  return `Heard ${payload.artistName} for the first time${genres ? ` (${genres})` : ''}`;
};

export const normalizePlaylistStarted = (payload: PlaylistPayload): string =>
  `Started playlist "${payload.playlistName}"${payload.owner ? ` by ${payload.owner}` : ''}`;

export const normalizePodcastStarted = (payload: PodcastPayload): string =>
  `Started podcast episode "${payload.episodeTitle}" from ${payload.showName}`;

export const normalizePodcastCompleted = (payload: PodcastPayload): string =>
  `Finished podcast episode "${payload.episodeTitle}" from ${payload.showName}${payload.listenedPercent !== undefined ? ` (${payload.listenedPercent}%)` : ''}`;

export const normalizeSessionEnded = (payload: SessionPayload): string => {
  const genres = payload.topGenres?.slice(0, 3).join(', ');
  return `Listening session ended: ${payload.trackCount} track${payload.trackCount === 1 ? '' : 's'} over ${payload.durationMinutes} min${genres ? `, top genres: ${genres}` : ''}`;
};
