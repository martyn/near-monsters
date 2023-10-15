//include common
const alphaPacksRemaining = Near.view(ftContract, "ft_balance_of", {account_id: ftContract});
const alphaPacksOwned = Near.view(ftContract, "ft_balance_of", {account_id: context.accountId});
const storageBalance = Near.view(ftContract, "storage_balance_of", {account_id: context.accountId});
const isRegistered = (storageBalance !== null);
const ONE_NEAR = Big("1e24");
const openPacksLink = "https://test.near.org/monstersdev.testnet/widget/openPack";
const error = (context.accountId ? null : "You must log in!");
State.init({packsToBuy: null, estimatedCost: 0, error: error});

const register = () => {
  try {
    // Perform smart contract call to buy packs
    Near.call(ftContract, 'storage_deposit', {}, Big("300000000000000"), ONE_NEAR/Big(100));
  } catch (e) {
    State.update({error:`Error from NEAR: ${e.message}`});
  }
}

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
      Near.call(ftContract, 'purchase', {}, Big("300000000000000"), state.packsToBuy*4*ONE_NEAR);
      State.update({error:null});
    } catch (e) {
      State.update({error:`Error from NEAR: ${e.message}`});
    }
  };

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
      <button onClick={handleSubmit} disabled={state.error !== null}>Buy Packs</button>
      <p>Estimated Cost: {state.estimatedCost} NEAR</p>
    </div>
  );
};

return (
  <div className="App">
    <Widget src={widgetSrc("header")}/>
    <div class="container border border-info p-3">
      <h3 class="text-center">
        <div>
          <span class="text-decoration-underline">{alphaPacksRemaining}</span> ALPHA packs remaining
        </div>
        <div>
          <span class="text-decoration-underline">{alphaPacksOwned}</span> packs owned
        </div>
      </h3>
      {
        isRegistered ? (
          <>
            <img src="https://github.com/martyn/near-monsters/blob/master/logo.jpeg?raw=true" width={256}/>
            <AlphaPurchase maxBuy={alphaPacksRemaining} ftContract={ftContract}/>
            <a href={openPacksLink}>Open Packs</a>
          </>
        ) : (
          <>
            <img src="https://github.com/martyn/near-monsters/blob/master/logo.jpeg?raw=true" width={256}/>
            <button onClick={register}>Register</button>
          </>
        )
      }
    </div>
  </div>
);
