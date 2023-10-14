extern crate csv;

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

    let mut rdr = csv::Reader::from_path("cards.csv").unwrap();

    // Extract headers from CSV to dynamically generate the struct
    let headers = rdr.headers().unwrap();
    writeln!(f, "pub struct NFTCardTemplate<'a> {{").unwrap();
    for header in headers.iter() {
        writeln!(f, "    pub {}: &'a str,", header).unwrap();
    }
    writeln!(f, "}}\n").unwrap();
    let mut rdr = csv::Reader::from_path("cards.csv").unwrap();
    let record_count = rdr.records().count();

    let mut rdr = csv::Reader::from_path("cards.csv").unwrap();
    writeln!(f, "const NFT_CARDS: [NFTCardTemplate; {}] = [", record_count).unwrap();

    // Populate struct instances dynamically using headers
    for result in rdr.records() {
        let record = result.unwrap();

        write!(f, "    NFTCardTemplate {{").unwrap();
        for (index, header) in headers.iter().enumerate() {
            let value = &record[index];
            write!(f, "        {}: \"{}\",", header, value).unwrap();
        }
        writeln!(f, "    }},").unwrap();
    }

    writeln!(f, "];").unwrap();


    writeln!(f, "pub fn get_nft_card_list<'a>() -> &'a [NFTCardTemplate<'a>] {{").unwrap();
    writeln!(f, "    &NFT_CARDS").unwrap();
    writeln!(f, "}}").unwrap();
}

