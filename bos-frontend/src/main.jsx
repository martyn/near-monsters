const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #FFFFFF;
  margin-right: auto; // Pushes it to the left
  cursor: pointer;
`;
const Nav = styled.div`
  display: flex;
  align-items: center;

  ul {
    display: flex;
    list-style-type: none;
    margin: 0;
    padding: 0;
    .selected {
      text-decoration:underline;
    }
    
    li {
      margin: 0 10px;
      cursor: pointer;

      a {
        text-decoration: none;
        color: #FFFFFF;
        transition: color 0.3s;

        &:hover {
          color: #FFA500; // You can choose a different hover color
        }
      }
    }
  }
`;
const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #7B68EE, #6A5ACD); // Gradient similar to the screenshot
  padding: 10px 50px;
  box-shadow: 0 2px 10px var(--blackA7);
`;

State.init({
  activeSection: "home",
});

const NavItem = ({ section, label }) => {
  const navClassName = (section) => {
    // Your logic to determine the className here
    return state.activeSection === section ? "selected" : "";
  };

  const selectSection = (section) => {
    State.update({ ...state, activeSection: section });
  };

  return (
    <li onClick={() => selectSection(section)}>
      <a className={navClassName(section)}>{label}</a>
    </li>
  );
};

const Header = () => {
  return (
    <StyledHeader>
      <Logo
        onClick={() => {
          State.update({ ...state, activeSection: "home" });
        }}
      >
        NEAR Monsters
      </Logo>
      <Nav>
        <ul>
          <NavItem section="purchase-alpha" label="Purchase ALPHA" />
          <NavItem section="inventory" label="Inventory" />
          <NavItem section="play" label="Play Game" />
          <NavItem section="marketplace" label="Trade" />
          <li>
            <Widget
              src="mob.near/widget/ProfileImage"
              props={{
                profile,
                accountId,
                className: "float-start d-inline-block me-2",
              }}
            />
          </li>
        </ul>
      </Nav>
    </StyledHeader>
  );
};

const Home = () => {
  return (
    <div className="Home">
      <img
        src="https://nearmonsters.s3.us-west-004.backblazeb2.com/web/OIG.jpeg"
        width="256"
      />
      "
      <p>
        Welcome! You've embarked on a path that few dare to venture - striving
        towards becoming an esteemed NEAR Monster Master; guardian of the
        magnificent creatures that populate this realm. However, be warned – it
        is not merely recreation but rather an immense responsibility and
        commitment you undertake.
      </p>
      <p>
        These near monsters are no ordinary digital entities - they possess
        sentience with unique personalities, histories, emotions; hopes & fears
        intertwined in their very being. They will trust only those who prove
        themselves worthy of it, love exclusively when deservedly earned and
        remember eternally any transgression committed against them or the bond
        shared between you both!
      </p>
      <p>
        Do not forget that these near monsters are mortal; like everything else
        within this world - they too shall perish one day. But take heart in
        knowing there exists a way to honor their memory, immortalising their
        spirit for eternity: by creating an NFT of your cherished NEAR Monster!
      </p>
      <p>
        An NFT is forever – unlike the transient material realm; it's original -
        standing apart from replicas within virtual worlds and most importantly
        precious beyond measure. It serves as a beautiful testament to the bond
        shared between you both, an unbreakable tether that outlives even
        mortality itself!
      </p>
      <p>
        Treasure these NFT’s but do not cling onto them; gift them if your heart
        desires however never trade or barter their worth away and collect for
        sentimental value rather than materialistic gain. This is the true way
        of a NEAR Monster Master, as taught by our wise sensei – may you find
        peace & harmony throughout this incredible journey! Farewell brave one;
        let your path be illuminated with joy from newfound friendships and
        eternal love forged between mankind's most fantastical creations - NEAR
        Monsters.
      </p>
      " - Grand Sensei
    </div>
  );
};
const Inventory = () => {
  const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1693936211939-67386471331489";
  const fullSetList = Near.view(nftContract, "full_set_listing", {});
  console.log("Full set list", fullSetList);
  return <div>Inventory</div>;
};
const Game = () => {
  return <div>Play game</div>;
};
const Marketplace = () => {
  return <div>Marketplace</div>;
};
const PurchaseAlpha = () => {
  return <div>Purchase Alpha</div>;
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
    <Header />
    <MainSection />
    <Footer />
  </div>
);

