//include common

const alphaPacksOwned = Near.view(ftContract, "ft_balance_of", {account_id: context.accountId});
const isOpenDisabled = (alphaPacksOwned === 0);
const nftsOwned = Near.view(nftContract, "nft_supply_for_owner", {account_id: context.accountId});
const nfts = Near.view(nftContract, "nft_tokens_for_owner", {account_id: context.accountId, limit:1000});//{from_index: (nftsOwned-5).toString(), limit:5});

const sortedNfts = nfts.sort((a, b) => {
  const dateA = Big(a.metadata.issued_at.replace(".", "").replace("Z", ""));
  const dateB = Big(b.metadata.issued_at.replace(".", "").replace("Z", ""));
  return (dateA < dateB) ? 1 : -1;
});

const revealNfts = sortedNfts.slice(0, 5);

const lastOpened = Storage.privateGet("lastOpened");
const allowReveal = (sortedNfts.length > 0) && (!lastOpened || (Big(sortedNfts[0].metadata.issued_at.replace(".", "").replace("Z", "")) > Big(lastOpened.replace(".", "").replace("Z", ""))));

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
    cursor: pointer;
  }
`;

const UnrevealedCard = styled.div`
  border: 3px solid;
`
const StyledCard = styled.div`
  border: 3px solid;

  ${({ rarity }) => {
    switch (rarity) {
      case 'Land':
        return `
          border-color: #33FF33;
          box-shadow: 0 0 10px gold;
        `;
      case 'Rare':
        return `
          border-color: gold;
          box-shadow: 0 0 10px gold;
        `;
      case 'Uncommon':
        return 'border-color: #3333FF;';
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

const getCurrentDatetime = () => {
  //mirror smart contract format
  const timestampMs = new Date().getTime();
  const timestampNs = timestampMs * 1_000_000;
  const timestampS = Math.floor(timestampNs / 1_000_000_000);
  const remainingNs = timestampNs % 1_000_000_000;
  const datetimeStr = `${timestampS}.000000000Z`;
  return datetimeStr;
}

const reveal = (index) => {
  let reveal = state.reveal;
  reveal[index] = true;
  State.update({ ...state, reveal: reveal });
};

const revealAll = () => {
  let currentIndex = 0;

  const loop = () => {
    if (currentIndex < 5) {
      reveal(currentIndex);
      currentIndex++;
      setTimeout(loop, 500);
    }
  };

  loop();
};

const hide = () => {
  Storage.privateSet("lastOpened", getCurrentDatetime());
}

const RevealableCard = ({ index, nft }) => {
  const revealCard = (index) => {
    return () => {reveal(index);}
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
          <>
          <UnrevealedCard rarity={rarity()}>
            <img onClick={revealCard(index)} src={"https://nearmonsters.s3.us-west-004.backblazeb2.com/alpha/final/back.png"} width={278} height={406}/>
          </UnrevealedCard>
          <p>{"Reveal"}</p>
          </>
        ) : (
          <>
          <StyledCard rarity={rarity()}>
            <img className={getEffectClass()} src={nft.metadata.media} width={278} height={406}/>
          </StyledCard>
          <p>{rarity()}</p>
          </>
        )
      }
    </CardLi>
  );
};

return (
  <App>
    <Widget src={widgetSrc("header")}/>
    <div class="container border border-info p-3">
      <h3 class="text-center">
        {state.error && <p className="error">{state.error}</p>}
        <div>
          <div>
            <span class="text-decoration-underline">{alphaPacksOwned}</span> packs owned
            <button onClick={openPack} disabled={isOpenDisabled}>Open</button>
            <a href={"purchase"}>Buy More</a>
          </div>
        </div>
      </h3>
      {allowReveal &&
        <div><p>Your pack is ready!</p>
          {state.reveal.every((x) => x) && <button onClick={hide}>Hide</button>}
          {state.reveal.some((x) => !x) && <button onClick={revealAll}>Reveal All</button>}
          <CardList>
            {revealNfts.map((nft, index) => (
              <RevealableCard nft={nft} index={index} />
            ))}
          </CardList>
        </div>
      }
    </div>
  </App>
)
