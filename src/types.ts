export interface SafeMessageWrapper<T extends object> {
  status: string;
  name: string;
  creationTimestamp: number;
  preparedSignature?: string;
  type: "MESSAGE";
  message: T;
}

export interface SnapshotMessageWrapper<T extends object> {
  types: object;
  domain: {
    name: string;
    version: string;
  };
  message: T;
  primaryType: "Proposal" | "Space" | "Vote";
}

export interface ProposalMessage {
  app: string;
  end: string;
  body: string;
  from: string;
  type: string;
  space: string;
  start: string;
  title: string;
  choices: string[];
  plugins: string;
  snapshot: string;
  timestamp: string;
  discussion: string;
}

export interface SpaceMessage {
  from: string;
  space: string;
  /**
   * Stringified JSON object containing the whole space settings
   */
  settings: string;
  timestamp: string;
}
