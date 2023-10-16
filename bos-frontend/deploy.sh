#!/bin/bash
json_data=$(cat ~/.near-credentials/testnet/monstersdev.testnet.json)
BOS_SIGNER_PUBLIC_KEY=$(echo $json_data | jq -r '.public_key')
BOS_SIGNER_PRIVATE_KEY=$(echo $json_data | jq -r '.private_key')

./build.sh
(cd build && bos components deploy monstersdev.testnet sign-as monstersdev.testnet network-config testnet sign-with-plaintext-private-key --signer-public-key "$BOS_SIGNER_PUBLIC_KEY" --signer-private-key "$BOS_SIGNER_PRIVATE_KEY" send)
