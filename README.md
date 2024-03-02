# snapshot-safe-synchronizer

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> Synchronize Snapshot ⚡ and Safe{Wallet} backends for offchain signatures

The EIP-1271 is now supported for offchain signatures by both snapshot & [safe](https://help.safe.global/en/articles/40783-what-are-signed-messages) backends.

However, Snapshot is not pulling signatures from safe after having collected all required signatures. 
This script is pulling signed messages from safe and pushing them to snapshot, after a small transformation to validate the payload.

You can run this script as a cron job to keep your snapshot proposals up to date with the latest signatures, or run it manually after
you have collected all required signatures.

## Getting started

You can run the script on the fly with npx:

```bash
npx snapshot-safe-sync <address-or-ens>
```

The CLI accept an optional --rpc-url to resolve the ENS. By default, the script is using the MAINNET_RPC_URL env variable, and fallbacks on the the default rpc of `ethers`

```bash
npx snapshot-safe-sync <address-or-ens> --rpc-url <rpc-url>
```

Or call the function in a script:

```js
const { getDefaultProvider } = require('ethers');
const { syncBackends } = require('snapshot-safe-sync');

const provider = getDefaultProvider();

syncBackends('<address-or-ens>', provider);
```
Or, with a module import:

```js
import { getDefaultProvider } from 'ethers';
import { syncBackends } from 'snapshot-safe-sync';

syncBackends('<address-or-ens>', getDefaultProvider(process.env.MAINNET_RPC_URL));
```

you can set a RPC_URL to resolve the ENS. By default, the script is using the default rpc of `ethers`

> **Warning**
> The script is build only for mainnet.

[build-img]: https://github.com/morpho-labs/snapshot-safe-sync/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/morpho-labs/snapshot-safe-sync/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/snapshot-safe-sync
[downloads-url]: https://www.npmtrends.com/snapshot-safe-sync
[npm-img]: https://img.shields.io/npm/v/snapshot-safe-sync
[npm-url]: https://www.npmjs.com/package/snapshot-safe-sync
[issues-img]: https://img.shields.io/github/issues/morpho-labs/snapshot-safe-sync
[issues-url]: https://github.com/morpho-labs/snapshot-safe-sync/issues
[codecov-img]: https://codecov.io/gh/morpho-labs/snapshot-safe-sync/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/morpho-labs/snapshot-safe-sync
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
