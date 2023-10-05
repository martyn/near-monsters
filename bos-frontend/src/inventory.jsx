  const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1693936211939-67386471331489";
  const fullSetList = Near.view(nftContract, "full_set_listing", {});
  console.log("Full set list", fullSetList);
  return <div><ul>
  {fullSetList.map((item) =>
    (<li>
      <label>{item.name} - {item.rarity}</label>
      <img src={item.url} width={224}/>
    </li>)
  )}
  </ul>
  </div>;

