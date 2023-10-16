#!/bin/bash

./build-prod.sh && NEAR_ENV=mainnet near deploy monsters-alpha.near target/wasm32-unknown-unknown/release/contracts_alpha.wasm
