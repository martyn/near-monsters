const widgetSrc = (component) => {
  return `monstersdev.testnet/widget/${component}`;
}

State.init({
  activeSection: "home",
});

const Home = () => {
  return (
    <div className="Home">
      <img
        src="https://nearmonsters.s3.us-west-004.backblazeb2.com/web/OIG.jpeg"
        width="256"
      />
    </div>
  );
};
const Inventory = () => {
  return <Widget src={widgetSrc("inventory")}/>
};
const Game = () => {
  return <div>Play game</div>;
};
const Marketplace = () => {
  return <div>Marketplace</div>;
};
const PurchaseAlpha = () => {
  return <Widget src={widgetSrc("purchase")}/>
};
const MainSection = () => (
  <div className="main">
    <div className="featured-pack">
      {state.activeSection === "home" && <Home />}
      {state.activeSection === "purchase-alpha" && <PurchaseAlpha />}
      {state.activeSection === "inventory" && <Inventory />}
      {state.activeSection === "play" && <Game />}
      {state.activeSection === "marketplace" && <Marketplace />}
    </div>
  </div>
);

const Footer = () => (
  <div className="footer">
    <div>&copy; 2023 NEAR Monsters</div>
  </div>
);

return (
  <div className="App">
    <MainSection />
    <Footer />
  </div>
);

