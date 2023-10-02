const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #FFFFFF;
  margin-right: auto; // Pushes it to the left
`;
const Nav = styled.div`
  display: flex;
  align-items: center;

  ul {
    display: flex;
    list-style-type: none;
    margin: 0;
    padding: 0;
    
    li {
      margin: 0 10px;

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
const Header = () => (
  <StyledHeader>
    <Logo>NEAR Monsters</Logo>
    <Nav>
      <ul>
        <li>
          <a href="#purchase-alpha">Purchase ALPHA</a>
        </li>
        <li>
          <a href="#inventory">Inventory</a>
        </li>
        <li>
          <a href="#play-game">Play</a>
        </li>
        <li>
          <a href="#marketplace">Marketplace</a>
        </li>
      </ul>
    </Nav>
  </StyledHeader>
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

