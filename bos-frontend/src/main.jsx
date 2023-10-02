const Header = () => (
  <div className="header">
    <div className="logo">NEAR Monsters</div>
    <div>
      <ul>
        <li>
          <a href="#purchase-alpha">Purchase ALPHA</a>
        </li>
        <li>
          <a href="#play-game">Play game</a>
        </li>
        <li>
          <a href="#marketplace">Marketplace</a>
        </li>
        <li>
          <a href="#about">About</a>
        </li>
      </ul>
    </div>
  </div>
);

const MainSection = () => (
  <div className="main">
    <div className="featured-pack">
      {/* Display your AI-generated artwork and details */}
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
    <Header />
    <MainSection />
    <Footer />
  </div>
);

