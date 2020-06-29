# Quick start

Semaphore has been tested with Node 11.14.0. It will run with Node 12 LTE but
we highly recommend using Node 11.14.0 if you wish to develop on its source
code, as one of its dependencies, `script`, cannot compile when if you use Node
12. 

Use [`nvm`](https://github.com/nvm-sh/nvm) to manage your Node version.

Clone this repository, install dependencies, and build the source code:

```bash
git clone git@github.com:kobigurk/semaphore.git && \
cd semaphore && \
npm i && \
npm run bootstrap && \
npm run build
```

**Note**: we use `lerna` to manage the `circuits`, `config`, and `contracts`
subpackages. Do not run `npm install` within any of these directories. Instead,
just run `npm run bootstrap` in the main directory.

Next, either download the compiled zk-SNARK circuit, proving key, and
verification key (note that these keys are for testing purposes, and not for
production, as there is no certainty that the toxic waste was securely
discarded).

To download the circuit, proving key, and verification key, run:

```bash
# Start from the base directory

./circuits/scripts/download_snarks.sh
```

To generate the above files locally instead, run:

```bash
# Start from the base directory

./circuits/scripts/build_snarks.sh
```

This process should take about 45 minutes.

Build the Solidity contracts (you need `solc` v 0.5.12 installed in your
`$PATH`):

```bash
# Start from the base directory

cd contracts && \
npm run compileSol
```

Run tests while still in the `contracts/` directory:

```bash
# The first command tests the Merkle tree contract and the second
# tests the Semaphore contract

npm run test-semaphore && \ 
npm run test-mt
```
