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
    writeln!(f, "pub struct MonsterTemplate<'a> {{").unwrap();
    writeln!(f, "    pub name: &'a str,").unwrap();
    writeln!(f, "    pub url: &'a str,").unwrap();
    writeln!(f, "    pub rarity: &'a str,").unwrap();
    writeln!(f, "    pub description: &'a str,").unwrap();
    writeln!(f, "    pub types: &'a str,").unwrap();
    writeln!(f, "    pub alignment: &'a str,").unwrap();
    writeln!(f, "    pub governance_style: &'a str,").unwrap();
    writeln!(f, "    pub visual_quality: &'a str,").unwrap();
    writeln!(f, "    pub attack: &'a str,").unwrap();
    writeln!(f, "    pub defense: &'a str,").unwrap();
    writeln!(f, "    pub power_score: &'a str,").unwrap();
    writeln!(f, "    pub mana: &'a str,").unwrap();
    writeln!(f, "}}").unwrap();


    // Parse the CSV and generate an array of MonsterTemplates
    writeln!(f, "pub fn get_monsters<'a>() -> Vec<MonsterTemplate<'a>> {{").unwrap();
    writeln!(f, "    vec![").unwrap();

    let mut rdr = csv::Reader::from_path("monsters.csv").unwrap();
    for result in rdr.records() {
        let record = result.unwrap();
        let name = &record[0];
        let description = &record[1];
        let rarity = &record[2];
        let types = &record[3];
        let alignment = &record[4];
        let governance_style = &record[5];
        let visual_quality = &record[6];
        let attack = &record[7];
        let defense = &record[8];
        let power_score = &record[9];
        let mana = &record[10];
        let url = &record[11];

        writeln!(f, "        MonsterTemplate {{ 
            name: \"{}\", 
            description: \"{}\", 
            rarity: \"{}\", 
            types: \"{}\", 
            alignment: \"{}\", 
            governance_style: \"{}\", 
            visual_quality: \"{}\", 
            attack: \"{}\", 
            defense: \"{}\", 
            power_score: \"{}\", 
            mana: \"{}\", 
            url: \"{}\" 
        }},", name, description, rarity, types, alignment, governance_style, visual_quality, attack, defense, power_score, mana, url).unwrap();
    }

    writeln!(f, "    ]").unwrap();
    writeln!(f, "}}").unwrap();
}

