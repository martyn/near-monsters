#!/bin/bash
./build-prod.sh && NEAR_ENV=mainnet near deploy monsters-nfts.near target/wasm32-unknown-unknown/release/contracts_nfts.wasm
