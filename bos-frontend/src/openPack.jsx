const ftContract = (context.networkId === "mainnet") ? "..." : "dev-1693882284306-75813657022630";
const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1693936211939-67386471331489";
const alphaPacksOwned = Near.view(ftContract, "ft_balance_of", {account_id: context.accountId});

State.init({error: null});
const openPack = () => {
  try {
    // Perform smart contract call to buy packs
    //Near.call(nftContract, 'mint_random', {amount: "1", token_owner_id: context.accountId}, 300000000000000, 6240000000000000000000);
    Near.call(ftContract, 'open_pack', {}, 300000000000000, 6240000000000000000000);
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
          <span class="text-decoration-underline">{alphaPacksOwned}</span> packs owned
        </div>
      </h3>
      <button onClick={openPack}>Open</button>
    </div>
  </>
)
