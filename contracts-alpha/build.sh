#!/bin/bash

RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
#cp $TARGET/wasm32-unknown-unknown/release/defi.wasm ./res/
#cp $TARGET/wasm32-unknown-unknown/release/fungible_token.wasm ./res/
