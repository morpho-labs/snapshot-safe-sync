#!/usr/bin/env node
import * as process from "process";

import { syncBackends } from "./syncBackends";
import { getDefaultProvider } from "ethers";

const addressOrEns = process.argv[2];

// accept --rpc-url as argument
const rpcUrlFlag = process.argv.indexOf("--rpc-url");
const rpcUrl = rpcUrlFlag !== -1 ? process.argv[rpcUrlFlag + 1] : process.env.MAINNET_RPC_URL;

if (!addressOrEns) throw new Error("Missing address or ENS name");

syncBackends(addressOrEns, getDefaultProvider(rpcUrl));
