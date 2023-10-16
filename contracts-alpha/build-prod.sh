#!/bin/bash

RUSTFLAGS='-C link-arg=-s' cargo build --features "use_prod_chain" --target wasm32-unknown-unknown --release
