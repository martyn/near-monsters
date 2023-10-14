  const nftContract = (context.networkId === "mainnet") ? "..." : "dev-1693936211939-67386471331489";
  const fullSetList = Near.view(nftContract, "full_set_listing", {});

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const FilterPane = styled.div`
  width: 20%;
  padding: 20px;
  border-right: 1px solid #ccc;
`;

const CardGrid = styled.div`
  width: 80%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
`;

const Card = styled.div`
  border: 1px solid #ccc;
  padding: 16px;
  text-align: center;
`;

const CardName = styled.label`
  display: block;
  margin-bottom: 8px;
`;

const CardImage = styled.img`
  width: 224px;
  height: auto;
`;
return (
	<Container>
		<FilterPane>
			{/* Filters will go here */}
		</FilterPane>
		<CardGrid>
			{fullSetList.map((item, index) => (
				<Card key={index}>
					<CardName>{item.name} - {item.rarity}</CardName>
					<CardImage src={item.url} />
					{/* Place to put how many copies the user owns */}
					<div>Copies: {item.copies}</div>
				</Card>
			))}
		</CardGrid>
	</Container>
);
