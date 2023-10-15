//include common

const alphaPacksOwned = Near.view(ftContract, "ft_balance_of", {account_id: context.accountId});
const isOpenDisabled = (alphaPacksOwned === 0);
const nftsOwned = Near.view(nftContract, "nft_supply_for_owner", {account_id: context.accountId});
const nfts = Near.view(nftContract, "nft_tokens_for_owner", {account_id: context.accountId, limit:1000});//{from_index: (nftsOwned-5).toString(), limit:5});
const sortedNfts = nfts.sort((a, b) => {
  const dateA = a.metadata.issued_at || "0000-00-00";
  const dateB = b.metadata.issued_at || "0000-00-00";
  return dateB.localeCompare(dateA);
});

const revealNfts = sortedNfts.slice(0, 5);
const purchaseLink = "https://test.near.org/monstersdev.testnet/widget/purchase";

const lastOpened = Storage.privateGet("lastOpened");
const allowReveal = (sortedNfts.length > 0) && (!lastOpened || (sortedNfts[0].metadata.issued_at.localeCompare(lastOpened)) < 0);

State.init({error: null, allowReveal: allowReveal, reveal: [false, false, false, false, false]});

const openPack = () => {
  try {
    Near.call(ftContract, 'open_pack', {}, 300000000000000, 10000000000000000000000);
  } catch (e) {
    State.update({error:`Error from NEAR: ${e.message}`});
  }
}

const RevealableCard = ({ index, nft }) => {
  const reveal = (index) => {
    return () => {
      let reveal = state.reveal;
      reveal[index]=true;
      //TODO: set storage if all revealed
      State.update({ ...state, reveal: reveal });
    }
  }
  const rarity = () => {
    return JSON.parse(nft.metadata.extra).rarity;
  }

  return (
    <li>
      {
        (!state.reveal[index]) ?
          (
            <button onClick={reveal(index)}>
              Reveal
            </button>
          ) : (
          <>
            <img src={nft.metadata.media} width={278}/>
            <p>{nft.metadata.title} {nft.metadata.description} {rarity()}</p>
          </>
        )
      }
    </li>
  );
};

return (
  <div className="App">
    <Widget src={widgetSrc("header")}/>
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
      {state.allowReveal &&
        <div><p>Your pack is ready</p>
          <ul>
            {revealNfts.map((nft, index) => (
              <RevealableCard nft={nft} index={index} />
            ))}
          </ul>
        </div>
      }
      <div>
        <span class="text-decoration-underline">{nftsOwned}</span> Monster NFTs collected
      </div>
    </div>
  </div>
)
