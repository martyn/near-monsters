const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1697260781994-51132633172656";
const fullSetList = Near.view(nftContract, "full_set_listing", {});
const nftsOwned = Near.view(nftContract, "nft_tokens_for_owner", {account_id: context.accountId, limit:50000});//{from_index: (nftsOwned-5).toString(), limit:5});
const ownedCount = nftsOwned.reduce((acc, nft) => {
  // Extract the token ID's numerical part
  const tokenId = parseInt(nft.token_id.split('-')[1].split(':')[0], 10);

  // Initialize or increment the count for the token ID
  acc[tokenId] = (acc[tokenId] || 0) + 1;

  return acc;
}, {});
State.init({error: null, owned: "all"});

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const FilterPane = styled.div`
  width: 20%;
  padding: 20px;
  border-right: 1px solid #ccc;
`;

const CardGrid = styled.div`
  width: 80%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
`;

const Card = styled.div`
  border: 1px solid #ccc;
  padding: 16px;
  text-align: center;
`;

const CardName = styled.label`
  display: block;
  margin-bottom: 8px;
`;

const CardImage = styled.img`
  width: 224px;
  height: auto;
`;

function setOwnedFilter(value) {
  State.update({ ...state, owned: value });
}
function setRarityFilter(value) {
  console.log("Set rarity filter", value);
}
return (
  <Container>
    <FilterPane>
      <div>
        <label>Owned:</label>
        <select onChange={(e) => setOwnedFilter(e.target.value)} value={state.ownedFilter}>
          <option value="all">All</option>
          <option value="owned">Owned Only</option>
        </select>
      </div>
      
      <div>
        <label>Rarity:</label>
        <select onChange={(e) => setRarityFilter(e.target.value)} value={rarityFilter}>
          <option value="All">All</option>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
        </select>
      </div>

      <div>
        <label>Type:</label>
        {["Undead", "Mage", "Demon", "Beast", "Warrior", "Spirit", "Elemental", "Vampire", "Celestial"].map((type) => (
          <div key={type}>
            <input 
              type="checkbox" 
              checked={false}
              onChange={() => {
                //const newTypeFilter = typeFilter.includes(type)
                //  ? typeFilter.filter(t => t !== type)
                //  : [...typeFilter, type];
                //setTypeFilter(newTypeFilter);
              }}
            />
            {type}
          </div>
        ))}
      </div>
    </FilterPane>
    <CardGrid>
      {fullSetList.map((item, index) => (
        ((state.owned == "owned" && (ownedCount[index] || 0) > 0) || state.owned == "all") &&
          <Card key={index}>
            <CardName>{item.name} - {item.rarity}</CardName>
            <CardImage src={item.url} />
            <div>Copies Owned: {ownedCount[index] || 0}</div>
          </Card>
      ))}
    </CardGrid>
  </Container>
);
