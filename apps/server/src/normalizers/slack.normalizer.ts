interface SlackMessagePayload {
  channelId: string;
  userId: string;
  text: string;
  ts?: string;
  threadTs?: string;
}

interface SlackReactionPayload {
  userId: string;
  reaction: string;
  channelId?: string;
}

interface SlackChannelPayload {
  userId: string;
  channelId: string;
}

export const normalizeSlackMessage = (payload: SlackMessagePayload): string =>
  `User ${payload.userId} sent a message in channel ${payload.channelId}: "${payload.text}"`;

export const normalizeSlackReaction = (payload: SlackReactionPayload): string =>
  `User ${payload.userId} reacted with :${payload.reaction}:${payload.channelId ? ` in channel ${payload.channelId}` : ''}`;

export const normalizeSlackChannelJoined = (payload: SlackChannelPayload): string =>
  `User ${payload.userId} joined channel ${payload.channelId}`;
