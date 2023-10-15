const widgetSrc = (component) => {
  if (context.networkId === "mainnet")
    return `.../${component}`;
  else
    return `monstersdev.testnet/widget/${component}`;
}
const ftContract = (context.networkId === "mainnet") ? "..." : "dev-1693882284306-75813657022630";
const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1697387315613-37447934459971";
