const childSrc =
  context.networkId === "mainnet" ? "..." : "monstersdev.testnet/widget/test";
let user_account = context.accountId;
return (
  <div>
    <p>A child dependency:</p>
    <p>{user_account}</p>
    <Widget src={childSrc} />
  </div>
);

