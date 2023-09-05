#!/bin/bash
#cargo build --all --target wasm32-unknown-unknown --release && near deploy monsters.test.near target/wasm32-unknown-unknown/release/contracts.wasm
cargo build --all --target wasm32-unknown-unknown --release && near dev-deploy target/wasm32-unknown-unknown/release/contracts-alpha.wasm
