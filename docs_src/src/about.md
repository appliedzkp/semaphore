# About

[Semaphore](https://github.com/appliedzkp/semaphore) is a zero-knowledge gadget
which allows Ethereum users to prove their membership of a set which they had
previously joined without revealing their original identity. At the same time,
it allows users to signal their endorsement of an arbitrary string. It is
designed to be a simple and generic privacy layer for Ethereum dApps. Use cases
include private voting, whistleblowing, mixers, and anonymous authentication.
Finally, it provides a simple built-in mechanism to prevent double-signalling
or double-spending.

This gadget comprises of smart contracts and
[zero-knowledge](https://z.cash/technology/zksnarks/) components which work in
tandem. The Semaphore smart contract handles state, permissions, and proof
verification on-chain. The zero-knowledge components work off-chain to allow
the user to generate proofs, which allow the smart contract to update its state
if these proofs are valid.

For a formal description of Semaphore and its underlying cryptographic
mechanisms, also see this document
[here](https://github.com/appliedzkp/semaphore/tree/master/spec).

Semaphore is designed for smart contract and dApp developers, not end users.
Developers should abstract its features away in order to provide user-friendly
privacy.

Try a simple demo [here](https://weijiekoh.github.io/semaphore-ui/) or read a
high-level description of Semaphore
[here](https://medium.com/coinmonks/to-mixers-and-beyond-presenting-semaphore-a-privacy-gadget-built-on-ethereum-4c8b00857c9b).

## Basic features

In sum, Semaphore provides the ability to:

1. Register an identity in a smart contract, and then:

2. Broadcast a signal:

    - Anonymously prove that their identity is in the set of registered
      identities, and at the same time:

    - Publicly store an arbitrary string in the contract, if and only if that
      string is unique to the user and the contract’s current external
      nullifier, which is a unique value akin to a topic. This means that
      double-signalling the same message under the same external nullifier is
      not possible.

### About external nullifiers

Think of an external nullifier as a voting booth where each user may only cast
one vote. If they try to cast a second vote a the same booth, that vote is
invalid.

An external nullifier is any 29-byte value. Semaphore always starts with one
external nullifier, which is set upon contract deployment. The owner of the
Semaphore contract may add more external nullifiers, deactivate, or reactivate
existing ones.

The first time a particular user broadcasts a signal to an active external
nullifier `n`, and if the user's proof of membership of the set of registered
users is valid, the transaction will succeed. The second time she does so to
the same `n`, however, her transaction will fail.

Additionally, all signals broadcast transactions to a deactivated external
nullifier will fail.

Each client application must use the above features of Semaphore in a unique
way to achieve its privacy goals. A mixer, for instance, would use one external
nullifier as such:

| Signal | External nullifier |
|-|-|
| The hash of the recipient's address, relayer's address, and the relayer's fee | The mixer contract's address |

This allows anonymous withdrawals of funds (via a transaction relayer, who is
rewarded with a fee), and prevents double-spending as there is only one
external nullifier.

An anonymous voting app would be configured differently:

| Signal | External nullifier |
|-|-|
| The hash of the respondent's answer | The hash of the question |

This allows any user to vote with an arbitary response (e.g. yes, no, or maybe)
to any question. The user, however, can only vote once per question.

## About the code

This repository contains the code for Semaphore's contracts written in
Soliidty, and zk-SNARK circuits written in
[circom](https://github.com/iden3/circom). It also contains Typescript code to
execute tests.

The code has been audited by ABDK Consulting. Their suggested security and
efficiency fixes have been applied.

A multi-party computation to produce the zk-SNARK proving and verification keys
for Semaphore will begin in the near future.

