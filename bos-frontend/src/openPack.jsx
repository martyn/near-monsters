const ftContract = (context.networkId === "mainnet") ? "..." : "dev-1693882284306-75813657022630";
const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1693936211939-67386471331489";
const alphaPacksOwned = Near.view(ftContract, "ft_balance_of", {account_id: context.accountId});
const nftsOwned = Near.view(nftContract, "nft_supply_for_owner", {account_id: context.accountId});
const nfts = Near.view(nftContract, "nft_tokens", {limit:1000});//{from_index: (nftsOwned-5).toString(), limit:5});
const sortedNfts = nfts.sort((a, b) => {
  const dateA = a.metadata?.issued_at || "0000-00-00";
  const dateB = b.metadata?.issued_at || "0000-00-00";
  return dateB.localeCompare(dateA);
});

const revealNfts = sortedNfts.slice(0, 5);

State.init({error: null});
const openPack = () => {
  try {
    Near.call(ftContract, 'open_pack', {}, 300000000000000, 6260000000000000000000);
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
            <button onClick={openPack}>Open</button>
          </div>
          <div><span class="text-decoration-underline">{nftsOwned}</span> nfts owned</div>
        </div>
      </h3>
      <ul>
      {
        revealNfts.map((nft) => <li><img src={nft.metadata.media} width={128}/>{nft.metadata.title} {nft.metadata.description}</li>)
      }
      </ul>
    </div>
  </>
)
