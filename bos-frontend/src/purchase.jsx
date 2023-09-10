const ftContract = (context.networkId === "mainnet") ? "..." : "dev-1693882284306-75813657022630";
const alphaPacksRemaining = Near.view(ftContract, "ft_balance_of", {account_id: ftContract});
const alphaPacksOwned = Near.view(ftContract, "ft_balance_of", {account_id: context.accountId});
const ONE_NEAR = 1e24;
const openPacksLink = "https://test.near.org/monstersdev.testnet/widget/openPack";
State.init({packsToBuy: null, estimatedCost: 0, error: null});

const AlphaPurchase = ({ maxBuy, ftContract }) => {
  const handleInputChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      State.update({error:null, packsToBuy: null, estimatedCost: 0});
      return;
    }
    if (value <= 0) {
      State.update({error:'Cannot buy less than 1 pack.'});
      return;
    }
    if (value > maxBuy) {
      State.update({error:'Cannot buy less than 1 pack.'});
      return;
    }
    State.update({error:null, packsToBuy: value, estimatedCost: (value * 4)});
  };

  const handleSubmit = () => {
    try {
      // Perform smart contract call to buy packs
      Near.call(ftContract, 'purchase', {}, 300000000000000, state.packsToBuy*4*ONE_NEAR);
      State.update({error:null});
    } catch (e) {
      State.update({error:`Error from NEAR: ${e.message}`});
    }
  };

  const register = () => {
    try {
      // Perform smart contract call to buy packs
      Near.call(ftContract, 'storage_deposit', {}, 300000000000000, ONE_NEAR/100);
    } catch (e) {
      State.update({error:`Error from NEAR: ${e.message}`});
    }

  }

  return (
    <div>
      {state.error && <p className="error">{state.error}</p>}
      <label htmlFor="packsToBuy">Number of Packs: </label>
      <input
        id="packsToBuy"
        type="number"
        value={state.packsToBuy}
        onChange={handleInputChange}
      />
      <button onClick={register}>Register</button>
      <button onClick={handleSubmit} disabled={state.error !== null}>Buy Packs</button>
      <p>Estimated Cost: {state.estimatedCost} NEAR</p>
    </div>
  );
};

return (
  <>
    <div class="container border border-info p-3">
      <h3 class="text-center">
        <div>
          <span class="text-decoration-underline">{alphaPacksRemaining}</span> packs remaining
        </div>
        <div>
          <span class="text-decoration-underline">{alphaPacksOwned}</span> packs owned
        </div>
      </h3>
      <AlphaPurchase maxBuy={alphaPacksRemaining} ftContract={ftContract}/>
      <a href={openPacksLink}>Open Packs</a>
    </div>
  </>
);
