#!/bin/bash
./build.sh && near dev-deploy target/wasm32-unknown-unknown/release/contracts_nfts.wasm
