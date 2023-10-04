  const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1693936211939-67386471331489";
  const fullSetList = Near.view(nftContract, "full_set_listing", {});
  const fullSetListTest = Near.view(nftContract, "full_set_listing_test", {});
  console.log("Full set list", fullSetList);
  console.log("Full set list test", fullSetListTest);
  return <div>Inventory</div>;

