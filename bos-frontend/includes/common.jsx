const widgetSrc = (component) => {
  if (context.networkId === "mainnet")
    return `monsters-bos.near/widget/${component}`;
  else
    return `monstersdev.testnet/widget/${component}`;
}
const ftContract = (context.networkId === "mainnet") ? "monsters-alpha.near" : "dev-1693882284306-75813657022630";
const nftContract = (context.networkId === "mainnet") ? "monsters-nfts.near" : "dev-1697387315613-37447934459971";
