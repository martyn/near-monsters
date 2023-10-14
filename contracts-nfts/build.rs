extern crate csv;

use std::env;
use std::fs::File;
use std::path::Path;
use std::io::Write;

fn main() {
    // Define output path
    let out_dir = "src";
    let dest_path = Path::new(&out_dir).join("generated_data.rs");
    let mut f = File::create(&dest_path).unwrap();

    writeln!(f, "use near_sdk::serde::Deserialize;").unwrap();
    writeln!(f, "use near_sdk::serde::Serialize;").unwrap();
    writeln!(f, "#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]").unwrap();
    writeln!(f, "#[cfg_attr(feature = \"abi\", derive(schemars::JsonSchema))]").unwrap();
    writeln!(f, "#[serde(crate = \"near_sdk::serde\")]").unwrap();
    writeln!(f, "pub struct NFTCardTemplate<'a> {{").unwrap();
    writeln!(f, "    pub id: &'a str,").unwrap();
    writeln!(f, "    pub name: &'a str,").unwrap();
    writeln!(f, "    pub url: &'a str,").unwrap();
    writeln!(f, "    pub rarity: &'a str,").unwrap();
    writeln!(f, "    pub description: &'a str,").unwrap();
    writeln!(f, "    pub types: &'a str,").unwrap();
    writeln!(f, "    pub alignment: &'a str,").unwrap();
    writeln!(f, "    pub governance_style: &'a str,").unwrap();
    writeln!(f, "    pub attack: &'a str,").unwrap();
    writeln!(f, "    pub defense: &'a str,").unwrap();
    writeln!(f, "    pub power_score: &'a str,").unwrap();
    writeln!(f, "    pub mana: &'a str,").unwrap();
    writeln!(f, "}}").unwrap();

    let mut rdr = csv::Reader::from_path("cards.csv").unwrap();
    let record_count = rdr.records().count();

    let mut rdr = csv::Reader::from_path("cards.csv").unwrap();
    writeln!(f, "const NFT_CARDS: [NFTCardTemplate; {}] = [", record_count).unwrap();
    for result in rdr.records() {
        let record = result.unwrap();
        let _id = &record[0];
        let name = &record[1];
        let description = &record[2];
        let rarity = &record[3];
        let types = &record[4];
        let alignment = &record[5];
        let governance_style = &record[6];
        let attack = &record[7];
        let defense = &record[8];
        let power_score = &record[9];
        let mana = &record[10];
        let url = &record[11];

        writeln!(f, "        NFTCardTemplate {{ 
            id: \"{}\",
            name: \"{}\", 
            description: \"{}\", 
            rarity: \"{}\", 
            types: \"{}\", 
            alignment: \"{}\", 
            governance_style: \"{}\", 
            attack: \"{}\", 
            defense: \"{}\", 
            power_score: \"{}\", 
            mana: \"{}\", 
            url: \"{}\" 
        }},", _id, name, description, rarity, types, alignment, governance_style, attack, defense, power_score, mana, url).unwrap();
    }
    writeln!(f, "];").unwrap();


    writeln!(f, "pub fn get_nft_card_map<'a>() -> HashMap<&'a str, NFTCardTemplate<'a>> {{").unwrap();
    writeln!(f, "    let mut nft_card_map: HashMap<&str, NFTCardTemplate> = HashMap::new();").unwrap();
    writeln!(f, "    for card in NFT_CARDS.iter().cloned() {{").unwrap();
    writeln!(f, "        nft_card_map.insert(card.id, card);").unwrap();
    writeln!(f, "    }}").unwrap();
    writeln!(f, "    nft_card_map").unwrap();
    writeln!(f, "}}").unwrap();


    writeln!(f, "pub fn get_nft_card_list<'a>() -> &'a [NFTCardTemplate<'a>] {{").unwrap();
    writeln!(f, "    &NFT_CARDS").unwrap();
    writeln!(f, "}}").unwrap();
}

