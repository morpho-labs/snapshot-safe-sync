#!/usr/bin/env node
import * as process from "process";

import { syncBackends } from "./syncBackends";

const addressOrEns = process.argv[2];
if (!addressOrEns) throw new Error("Missing address or ENS name");

syncBackends(addressOrEns);
