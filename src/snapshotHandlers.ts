import { ProposalMessage, SpaceMessage, VoteMessage } from "./types";

const snapshotDomain = {
  name: "snapshot",
  version: "0.1.4",
};

const handleProposal = async (message: ProposalMessage) => {
  console.log(`Handling proposal ${message.title}`);
  const proposalTypes = {
    Proposal: [
      {
        name: "from",
        type: "address",
      },
      {
        name: "space",
        type: "string",
      },
      {
        name: "timestamp",
        type: "uint64",
      },
      {
        name: "type",
        type: "string",
      },
      {
        name: "title",
        type: "string",
      },
      {
        name: "body",
        type: "string",
      },
      {
        name: "discussion",
        type: "string",
      },
      {
        name: "choices",
        type: "string[]",
      },
      {
        name: "start",
        type: "uint64",
      },
      {
        name: "end",
        type: "uint64",
      },
      {
        name: "snapshot",
        type: "uint64",
      },
      {
        name: "plugins",
        type: "string",
      },
      {
        name: "app",
        type: "string",
      },
    ],
  };
  return {
    types: proposalTypes,
    domain: snapshotDomain,
    message: {
      ...message,
      start: +message.start,
      end: +message.end,
      snapshot: +message.snapshot,
      timestamp: +message.timestamp,
    },
  };
};
const handleSpace = async (message: SpaceMessage) => {
  const readableTime = new Date(+message.timestamp * 1000).toLocaleString();
  console.log(`Handling space ${message.space} submitted at ${readableTime}`);
  const spaceTypes = {
    Space: [
      {
        name: "from",
        type: "address",
      },
      {
        name: "space",
        type: "string",
      },
      {
        name: "timestamp",
        type: "uint64",
      },
      {
        name: "settings",
        type: "string",
      },
    ],
  };
  return {
    types: spaceTypes,
    domain: snapshotDomain,
    message: {
      ...message,
      timestamp: +message.timestamp,
    },
  };
};

const handleVote = async (message: VoteMessage) => {
  const readableTime = new Date(+message.timestamp * 1000).toLocaleString();
  console.log(`Handling vote ${message.proposal} submitted at ${readableTime}`);
  const voteTypes = {
    Vote: [
      {
        name: "from",
        type: "address",
      },
      {
        name: "space",
        type: "string",
      },
      {
        name: "timestamp",
        type: "uint64",
      },
      {
        name: "proposal",
        type: "bytes32",
      },
      {
        name: "choice",
        type: "uint32",
      },
      {
        name: "reason",
        type: "string",
      },
      {
        name: "app",
        type: "string",
      },
      {
        name: "metadata",
        type: "string",
      },
    ],
  };
  return {
    types: voteTypes,
    domain: snapshotDomain,
    message: {
      ...message,
      // TODO: is it working for all type of votes? Like weighted voting
      choice: +message.choice,
      timestamp: +message.timestamp,
    },
  };
};

export const Handlers = {
  handleProposal,
  handleSpace,
  handleVote,
};
