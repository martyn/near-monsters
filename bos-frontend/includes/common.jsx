const widgetSrc = (component) => {
  if (context.networkId === "mainnet")
    return `monsters-bos.near/widget/${component}`;
  else
    return `monstersdev.testnet/widget/${component}`;
}
const ftContract = (context.networkId === "mainnet") ? "monsters-alpha.near" : "dev-1693882284306-75813657022630";
const nftContract = (context.networkId === "mainnet") ? "monsters-nfts.near" : "dev-1697387315613-37447934459971";

const App = styled.div`
	button {
			background-color: #563D7C;
			border: none;
			color: #EDEDED;
			padding: 10px 20px;
			text-align: center;
			text-decoration: none;
			display: inline-block;
			font-size: 16px;
			border-radius: 5px;
			box-shadow: 2px 2px 4px #000;
			transition: background-color 0.3s ease;
	}

	button:hover {
			background-color: #8C6BB1;
	}
`;


