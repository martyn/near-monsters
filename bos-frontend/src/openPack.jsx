//include common

const alphaPacksOwned = Near.view(ftContract, "ft_balance_of", {account_id: context.accountId});
const isOpenDisabled = (alphaPacksOwned === 0);
const nftsOwned = Near.view(nftContract, "nft_supply_for_owner", {account_id: context.accountId});
const nfts = Near.view(nftContract, "nft_tokens_for_owner", {account_id: context.accountId, limit:1000});//{from_index: (nftsOwned-5).toString(), limit:5});
const sortedNfts = nfts.sort((a, b) => {
  const dateA = a.metadata.issued_at;
  const dateB = b.metadata.issued_at;
  return new Date(dateB) < new Date(dateA);
});

const revealNfts = sortedNfts.slice(0, 5);
const purchaseLink = "https://test.near.org/monstersdev.testnet/widget/purchase";

const lastOpened = Storage.privateGet("lastOpened");
const allowReveal = true;//(sortedNfts.length > 0) && (!lastOpened || (new Date(sortedNfts[0].metadata.issued_at) > new Date(lastOpened)));

State.init({error: null, reveal: [false, false, false, false, false]});

const CardList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 20px; // Provides spacing between each card.
  justify-content: center; // Centers the cards in the middle.
  padding: 0;
  list-style-type: none; // Removes bullet points from the ul.
`;

const CardLi = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  box-sizing: border-box; // Ensures padding doesn't increase card size.
  
  img {
    transition: all 1s ease-in-out;
    transform-origin: center;

    // Initial states
    opacity: 0;
    transform: scale(0.8);

    &.revealed {
      opacity: 1;
      transform: scale(1);
    }

    &.uncommon-effect.revealed {
      transform: scale(1.1);
    }

    &.rare-effect.revealed {
      transform: rotateY(360deg);
    }

    &.land-effect.revealed {
      transform: rotateY(360deg) scale(1.1);
    }
  }
`;

const StyledCard = styled.div`
  border: 3px solid;

  ${({ rarity }) => {
    switch (rarity) {
      case 'Land':
        return `
          border-image: url('/path-to-land-border.png') 30 round; 
          background: url('/path-to-land-background.gif');
        `;
      case 'Rare':
        return `
          border-color: gold;
          box-shadow: 0 0 10px gold;
        `;
      case 'Uncommon':
        return 'border-color: silver;';
      default:
        return 'border-color: gray;';
    }
  }}
`;

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
          reveal[index] = false;
          State.update({ ...state, reveal: reveal });

          setTimeout(() => {
              let reveal = state.reveal;
              reveal[index] = true;
              if(reveal.every((x) => x)) {
                Storage.privateSet("lastOpened", (new Date()).toISOString());
                console.log("Set last opened", Storage.privateGet("lastOpened"));
              }
              State.update({ ...state, reveal: reveal });
          }, 50);
      };
  };
  const rarity = () => {
    return JSON.parse(nft.metadata.extra).rarity;
  }

  const getRarityClass = (rarityValue) => {
    switch(rarityValue) {
      case 'Land': return 'land-effect';
      case 'Rare': return 'rare-effect';
      case 'Uncommon': return 'uncommon-effect';
      default: return 'common-effect';
    }
  };

  const getEffectClass = () => {
    if (state.reveal[index]) {
      return `revealed ${getRarityClass(rarity())}`;
    }
    return '';
  };

  return (
    <CardLi>
      {
        (!state.reveal[index]) ? (
          <button onClick={reveal(index)}>Reveal</button>
        ) : (
          <StyledCard rarity={rarity()}>
            <img className={getEffectClass()} src={nft.metadata.media} width={278} />
            <p>{nft.metadata.title} {nft.metadata.description} {rarity()}</p>
          </StyledCard>
        )
      }
    </CardLi>
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
      {allowReveal &&
        <div><p>Your pack is ready!</p>
          <CardList>
            {revealNfts.map((nft, index) => (
              <RevealableCard nft={nft} index={index} />
            ))}
          </CardList>
        </div>
      }
    </div>
  </div>
)
