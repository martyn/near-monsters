const ftContract = (context.networkId === "mainnet") ? "..." : "dev-1693882284306-75813657022630";
const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1697311460688-92526053453432";
const alphaPacksOwned = Near.view(ftContract, "ft_balance_of", {account_id: context.accountId});
const isOpenDisabled = (alphaPacksOwned === 0);
const nftsOwned = Near.view(nftContract, "nft_supply_for_owner", {account_id: context.accountId});
const nfts = Near.view(nftContract, "nft_tokens_for_owner", {account_id: context.accountId, limit:1000});//{from_index: (nftsOwned-5).toString(), limit:5});
const sortedNfts = nfts.sort((a, b) => {
  const dateA = a.metadata?.issued_at || "0000-00-00";
  const dateB = b.metadata?.issued_at || "0000-00-00";
  return dateB.localeCompare(dateA);
});

const revealNfts = sortedNfts.slice(0, 5);
const purchaseLink = "https://test.near.org/monstersdev.testnet/widget/purchase";

State.init({error: null});
const openPack = () => {
  try {
    Near.call(ftContract, 'open_pack', {}, 300000000000000, 10000000000000000000000);
  } catch (e) {
    State.update({error:`Error from NEAR: ${e.message}`});
  }

}

return (
  <>
    <div class="container border border-info p-3">
      <h3 class="text-center">
        {state.error && <p className="error">{state.error}</p>}
        <div>
          <div>
            <span class="text-decoration-underline">{alphaPacksOwned}</span> packs owned
            <button onClick={openPack} disabled={isOpenDisabled}>Open</button>
            <a href={purchaseLink}>Buy More</a>
          </div>
        </div>
      </h3>
      <ul>
      {
        revealNfts.map((nft) => <li><img src={nft.metadata.media} width={128}/>{nft.metadata.title} {nft.metadata.description} {nft.metadata.extra.rarity}</li>)
      }
      </ul>
      <div>
        <span class="text-decoration-underline">{nftsOwned}</span> Monster NFTs collected
      </div>
    </div>
  </>
)
