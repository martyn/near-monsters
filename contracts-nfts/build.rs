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

    // Write the struct definition
    writeln!(f, "pub struct MonsterTemplate<'a> {{").unwrap();
    writeln!(f, "    pub name: &'a str,").unwrap();
    writeln!(f, "    pub url: &'a str,").unwrap();
    writeln!(f, "    pub rarity: &'a str,").unwrap();
    writeln!(f, "}}").unwrap();

    // Parse the CSV and generate an array of MonsterTemplates
    writeln!(f, "pub fn get_monsters<'a>() -> Vec<MonsterTemplate<'a>> {{").unwrap();
    writeln!(f, "    vec![").unwrap();

    let mut rdr = csv::Reader::from_path("monsters.csv").unwrap();
    for result in rdr.records() {
        let record = result.unwrap();
        let name = &record[1];
        let url = &record[0];
        let rarity = &record[2];
        writeln!(f, "        MonsterTemplate {{ name: \"{}\", url: \"{}\", rarity: \"{}\"}},", name, url, rarity).unwrap();
    }

    writeln!(f, "    ]").unwrap();
    writeln!(f, "}}").unwrap();
}

