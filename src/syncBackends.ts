import { getDefaultProvider, utils } from "ethers";

import snapshot from "@snapshot-labs/snapshot.js";

import { envelope } from "./constants";
import { ProposalMessage, SafeMessageWrapper, SnapshotMessageWrapper, SpaceMessage } from "./types";

const configuration = {
  snapshotHubUrl: "https://hub.snapshot.org",
  safeUrl: "https://safe-client.safe.global",
  snapshotSequencerUrl: "https://seq.snapshot.org",
  snapshotDelayValidation: 3600 * 24 * 3, // 3 days
  // TODO: support multiple networks
  chainId: 1,
  eip3770Prefix: "eth",
};

const resolveAddress = async (ensOrAddressLike: string) => {
  if (utils.isAddress(ensOrAddressLike)) return ensOrAddressLike;
  // support EIP 3770
  if(ensOrAddressLike.split(":")[0] === configuration.eip3770Prefix) {
    const address = ensOrAddressLike.split(":")[1];
    if(!utils.isAddress(address)) throw new Error(`Invalid address ${address}`);
    return address;
  }
  // support EIP 2304
  if (!ensOrAddressLike.match(/^.*\.eth$/))
    throw new Error(`Invalid address or ENS name ${ensOrAddressLike}`);

  const provider = getDefaultProvider(process.env.RPC_URL);
  const resolvedAddress = await provider.resolveName(ensOrAddressLike);
  if (!resolvedAddress) throw new Error(`Failed to resolve ENS address ${ensOrAddressLike}`);

  return resolvedAddress;
};

const fetchUrl = (url: string, method = "GET") =>
  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

type SafeSnapshotMessage = SafeMessageWrapper<
  SnapshotMessageWrapper<ProposalMessage | SpaceMessage>
>;
export const fetchAllPotentialsMessages = async (url: string): Promise<SafeSnapshotMessage[]> => {
  const { next, results } = await fetchUrl(url);

  const snapshotMessages: SafeSnapshotMessage[] = results.filter(
    (m: SafeSnapshotMessage) => m.type === "MESSAGE" && m.name === "Snapshot"
  );

  if (next === null) return snapshotMessages;

  const lastMessage = results[results.length - 1];
  const lastMessageTs = lastMessage.timestamp || lastMessage.creationTimestamp;

  if (lastMessageTs && lastMessageTs + configuration.snapshotDelayValidation > Date.now() / 1000) {
    return [...snapshotMessages, ...(await fetchAllPotentialsMessages(next))];
  }
  return snapshotMessages;
};

export const syncBackends = async (safeAddressOrEns: string) => {
  const safeAddress = await resolveAddress(safeAddressOrEns);
  console.log(`Synchronizing Snapshot and Safe for ${safeAddressOrEns}`);
  const safeUrl = `${configuration.safeUrl}/v1/chains/${configuration.chainId}/safes/${safeAddress}/messages`;
  const allSnapshotMessages = await fetchAllPotentialsMessages(safeUrl);
  console.log(allSnapshotMessages.length, "non expired snapshot messages found");

  const fullySignedMessages = allSnapshotMessages.filter(
    (m) => m.status === "CONFIRMED" && m.preparedSignature
  );

  console.log(fullySignedMessages.length, "fully signed snapshot messages found");

  const nonExpiredMessages = fullySignedMessages.filter(
    (m) => +m.message.message.timestamp + configuration.snapshotDelayValidation > Date.now() / 1000
  );
  console.log(nonExpiredMessages.length, "non expired snapshot messages found");

  console.log("-".repeat(100));
  const messageResults: {
    message: SafeSnapshotMessage;
    hasError: boolean;
    error?: any;
    result?: object;
  }[] = [];

  for (const message of nonExpiredMessages) {
    try {
      const { primaryType, ...snapshotMessage } = message.message;

      let data: object;

      switch (primaryType) {
        case "Proposal":
          data = await handleProposal(snapshotMessage.message as ProposalMessage);
          break;
        case "Space":
          data = await handleSpace(snapshotMessage.message as SpaceMessage);
          break;
        default:
          throw Error(`Unknown primary type ${primaryType}`);
      }
      const payload = {
        address: safeAddress.toLowerCase(),
        sig: message.preparedSignature!,
        data,
      };

      const isValidOrErrors = snapshot.utils.validateSchema(envelope, payload);

      if (isValidOrErrors !== true) {
        throw Error(
          `Invalid payload: \n${isValidOrErrors}\n Payload: \n ${JSON.stringify(payload, null, 2)}`
        );
      }

      const isSignatureValid = await snapshot.utils.verify(
        payload.address,
        payload.sig,
        payload.data
      );
      if (!isSignatureValid) {
        throw Error(`Invalid signature`);
      }
      const sequencerResult = await fetch(configuration.snapshotSequencerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload, null, 2),
      }).then(async (res) => {
        if (!res.ok)
          throw new Error(
            `Failed to fetch to sequencer:\n${JSON.stringify(await res.json(), null, 2)}`
          );
        return res.json();
      });
      console.log(`⚡ Submitted to sequencer:\n ${JSON.stringify(sequencerResult, null, 2)}`);
      messageResults.push({
        message,
        hasError: false,
        result: sequencerResult,
      });
    } catch (e) {
      console.log("Failed to submit message", e);
      messageResults.push({
        message,
        hasError: true,
        error: e,
      });
    } finally {
      console.log("-".repeat(100));
    }
  }
  return messageResults;
};
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
