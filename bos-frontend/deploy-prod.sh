#!/bin/bash
json_data=$(cat ~/.near-credentials/mainnet/monsters-bos.near.json)
BOS_SIGNER_PUBLIC_KEY=$(echo $json_data | jq -r '.public_key')
BOS_SIGNER_PRIVATE_KEY=$(echo $json_data | jq -r '.private_key')

./build.sh
(cd build && bos components deploy monsters-bos.near sign-as monsters-bos.near network-config mainnet sign-with-plaintext-private-key --signer-public-key "$BOS_SIGNER_PUBLIC_KEY" --signer-private-key "$BOS_SIGNER_PRIVATE_KEY" send)
