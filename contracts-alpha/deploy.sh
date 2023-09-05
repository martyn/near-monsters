#!/bin/bash
#cargo build --all --target wasm32-unknown-unknown --release && near deploy monsters.test.near target/wasm32-unknown-unknown/release/contracts.wasm
./build.sh && near dev-deploy target/wasm32-unknown-unknown/release/contracts_alpha.wasm
