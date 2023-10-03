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
      <Logo>NEAR Monsters</Logo>
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
  return <div>About</div>
}
const MainSection = () => (
  <div className="main">
    <div className="featured-pack">
    {state.activeSection === "home" && <Home/>}
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

