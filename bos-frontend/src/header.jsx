//include common

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

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #FFFFFF;
  margin-right: auto; // Pushes it to the left
  cursor: pointer;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #7B68EE, #6A5ACD); // Gradient similar to the screenshot
  padding: 10px 50px;
  box-shadow: 0 2px 10px var(--blackA7);
`;

const NavItem = ({ section, label }) => {
  const navClassName = (section) => {
    return "";
  };

  return (
    <li onClick={() => selectSection(section)}>
      <a className={navClassName(section)} href={section}>{label}</a>
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
          <NavItem section="purchase" label="Purchase ALPHA" />
          <NavItem section="inventory" label="Inventory" />
          <NavItem section="marketplace" label="Trade" />
          <li>
            <Widget
              src={widgetSrc("ProfileImage")}
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

return <Header />
