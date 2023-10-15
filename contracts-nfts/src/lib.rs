use std::collections::HashMap;
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_sdk::collections::LookupMap;
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_contract_standards::non_fungible_token::approval::NonFungibleTokenApproval;
use near_contract_standards::non_fungible_token::core::{NonFungibleTokenCore, NonFungibleTokenResolver};
use near_contract_standards::non_fungible_token::enumeration::NonFungibleTokenEnumeration;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::{
    env, log, near_bindgen, require, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue, ONE_NEAR
};
use near_sdk::json_types::U128;
use near_sdk::env::random_seed;
use near_sdk::serde_json;

fn get_current_datetime() -> String {
    // Get the current block timestamp in nanoseconds.
    let timestamp_ns = env::block_timestamp();
    
    // Convert nanoseconds to seconds.
    let timestamp_s = timestamp_ns / 1_000_000_000;
    
    // Calculate the remaining nanoseconds after the seconds are accounted for.
    let remaining_ns = timestamp_ns % 1_000_000_000;

    //#TODO This is not actually iso8601. Adding chronos library causes smart contract panick.
    let datetime_str = format!("{}.{:09}Z", timestamp_s, remaining_ns);
    
    datetime_str
}

fn get_token_id(card_id:&str, card_count:u64) -> String {
    format!("{}:{}", card_id, card_count)
}

include!("generated_data.rs");

pub fn get_nft_cards_by_rarity<'a>(rarity: &str) -> Vec<NFTCardTemplate<'a>> {
    get_nft_card_list()
        .iter()
        .filter(|&card| card.rarity == rarity)
        .cloned()
        .collect()
}

pub fn get_land_nft_cards<'a>() -> Vec<NFTCardTemplate<'a>> {
    get_nft_cards_by_rarity("Land")
}

pub fn get_rare_nft_cards<'a>() -> Vec<NFTCardTemplate<'a>> {
    get_nft_cards_by_rarity("Rare")
}

pub fn get_uncommon_nft_cards<'a>() -> Vec<NFTCardTemplate<'a>> {
    get_nft_cards_by_rarity("Uncommon")
}

pub fn get_common_nft_cards<'a>() -> Vec<NFTCardTemplate<'a>> {
    get_nft_cards_by_rarity("Common")
}

pub fn get_nft_card_map<'a>() -> HashMap<String, NFTCardTemplate<'a>> {
    let mut nft_card_map: HashMap<String, NFTCardTemplate> = HashMap::new();
    for card in NFT_CARDS.iter().cloned() {
        let id_str = card.id.to_string();
        nft_card_map.insert(id_str, card);
    }
    nft_card_map
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    copies_by_card_id: Option<LookupMap<String, u64>>,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 288 288'%3E%3Cg id='l' data-name='l'%3E%3Cpath d='M187.58,79.81l-30.1,44.69a3.2,3.2,0,0,0,4.75,4.2L191.86,103a1.2,1.2,0,0,1,2,.91v80.46a1.2,1.2,0,0,1-2.12.77L102.18,77.93A15.35,15.35,0,0,0,90.47,72.5H87.34A15.34,15.34,0,0,0,72,87.84V201.16A15.34,15.34,0,0,0,87.34,216.5h0a15.35,15.35,0,0,0,13.08-7.31l30.1-44.69a3.2,3.2,0,0,0-4.75-4.2L96.14,186a1.2,1.2,0,0,1-2-.91V104.61a1.2,1.2,0,0,1,2.12-.77l89.55,107.23a15.35,15.35,0,0,0,11.71,5.43h3.13A15.34,15.34,0,0,0,216,201.16V87.84A15.34,15.34,0,0,0,200.66,72.5h0A15.35,15.35,0,0,0,187.58,79.81Z'/%3E%3C/g%3E%3C/svg%3E";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
}

#[cfg(feature = "use_prod_chain")]
const MONSTERS_ALPHA_CONTRACT: &str = "monsters_nfts.near";

#[cfg(not(feature = "use_prod_chain"))]
const MONSTERS_ALPHA_CONTRACT: &str = "dev-1693882284306-75813657022630";


#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "NEAR MONSTERS NFT Collection".to_string(),
                symbol: "MONSTERS".to_string(),
                icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        require!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            copies_by_card_id: Some(LookupMap::new(b"m"))
        }
    }

    #[payable]
    pub fn mint_random(&mut self, amount: U128, token_owner_id: AccountId) -> Vec<Token> {
        assert_eq!(env::predecessor_account_id(), AccountId::new_unchecked(MONSTERS_ALPHA_CONTRACT.into()), "Unauthorized");
        (0..amount.into()).map(|index| {
            let i = index as usize;
            let roll = random_seed()[i*2] as usize;
            let cards = if roll < 8 {
                get_land_nft_cards()
            } else if roll < 35 {
                get_rare_nft_cards()
            } else if roll < 96 {
                get_uncommon_nft_cards()
            } else {
                get_common_nft_cards()
            };
            let card_index:usize = random_seed()[i*2+1] as usize % cards.len();
            let card = &cards[card_index];
            let card_count: u64 = match &self.copies_by_card_id {
                Some(copies) => {
                    copies.get(&card.id.to_string()).map_or(1, |count| count + 1)
                },
                None => 1,
            };
            let token_id = get_token_id(card.id, card_count);

            let token_metadata = TokenMetadata {
                title: None,
                description: None,
                media: None,
                media_hash: None,
                copies: None,
                issued_at: Some(get_current_datetime()),
                expires_at: None,
                starts_at: None,
                updated_at: None,
                extra: None,
                reference: None,
                reference_hash: None,
            };

            log!("Creating card with token_id {}", token_id);
            if let Some(copies_count) = &mut self.copies_by_card_id {
                copies_count.insert(&card.id.to_string(), &card_count);
            }
            self.tokens.internal_mint(token_id.into(), token_owner_id.clone(), Some(token_metadata))

        }).collect()
    }

    pub fn full_set_listing(&self) -> Vec<NFTCardTemplate> {
        get_nft_card_list().to_vec()
    }

    fn enrich_token_with_card_data(&self, token: &mut Token) {
        let card_id = token.token_id.split(':')
            .next()
            .map(|s| s.to_string())
            .unwrap();
        let card_count: u64 = match &self.copies_by_card_id {
            Some(copies) => {
                copies.get(&card_id).map_or(1, |count| count)
            },
            None => 1,
        };
        let nft_card_map = get_nft_card_map();
        if let Some(card) = nft_card_map.get(&card_id) {
            let existing_metadata = token.metadata.clone().unwrap_or_default();

            let mut json_value: serde_json::Value = serde_json::to_value(&card).unwrap();
            let obj = json_value.as_object_mut().unwrap();

            obj.remove("name");
            obj.remove("url");
            obj.remove("description");

            let extra = Some(serde_json::to_string(&json_value).unwrap());

            let token_metadata = TokenMetadata {
                title: Some(card.name.to_string()),
                description: Some(card.description.to_string()),
                media: Some(card.url.to_string()),
                media_hash: None,
                copies: Some(card_count),  // we can look this up later
                issued_at: existing_metadata.issued_at,
                expires_at: None,
                starts_at: None,
                updated_at: None,
                extra: extra,
                reference: None,
                reference_hash: None,
            };

            token.metadata = Some(token_metadata);
        }
    }

}

#[near_bindgen]
impl NonFungibleTokenCore for Contract {
    #[payable]
    fn nft_transfer(&mut self, receiver_id: AccountId, token_id: TokenId, approval_id: Option<u64>, memo: Option<String>) {
        self.tokens.nft_transfer(receiver_id, token_id, approval_id, memo);
    }

    #[payable]
    fn nft_transfer_call(&mut self, receiver_id: AccountId, token_id: TokenId, approval_id: Option<u64>, memo: Option<String>, msg: String) -> PromiseOrValue<bool> {
        self.tokens.nft_transfer_call(receiver_id, token_id, approval_id, memo, msg)
    }

    fn nft_token(&self, token_id: TokenId) -> Option<Token> {
        let original_token = self.tokens.nft_token(token_id);

        original_token.map(|mut token| {
            self.enrich_token_with_card_data(&mut token);
            token
        })
    }
}

#[near_bindgen]
impl NonFungibleTokenResolver for Contract {
    #[private]
    fn nft_resolve_transfer(&mut self, previous_owner_id: AccountId, receiver_id: AccountId, token_id: TokenId, approved_account_ids: Option<HashMap<AccountId, u64>>) -> bool {
        self.tokens.nft_resolve_transfer(previous_owner_id, receiver_id, token_id, approved_account_ids)
    }
}

#[near_bindgen]
impl NonFungibleTokenApproval for Contract {
    #[payable]
    fn nft_approve(&mut self, token_id: TokenId, account_id: AccountId, msg: Option<String>) -> Option<Promise> {
        self.tokens.nft_approve(token_id, account_id, msg)
    }

    #[payable]
    fn nft_revoke(&mut self, token_id: TokenId, account_id: AccountId) {
        self.tokens.nft_revoke(token_id, account_id);
    }

    #[payable]
    fn nft_revoke_all(&mut self, token_id: TokenId) {
        self.tokens.nft_revoke_all(token_id);

    }

    fn nft_is_approved(&self, token_id: TokenId, approved_account_id: AccountId, approval_id: Option<u64>) -> bool {
        self.tokens.nft_is_approved(token_id, approved_account_id, approval_id)
    }
}

#[near_bindgen]
impl NonFungibleTokenEnumeration for Contract {
    fn nft_total_supply(&self) -> U128 {
        self.tokens.nft_total_supply()
    }

    fn nft_tokens(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<Token> {
        let original_tokens = self.tokens.nft_tokens(from_index, limit);

        original_tokens.into_iter().map(|mut token| {
            self.enrich_token_with_card_data(&mut token);
            token
        }).collect()
    }


    fn nft_supply_for_owner(&self, account_id: AccountId) -> U128 {
        self.tokens.nft_supply_for_owner(account_id)
    }

    fn nft_tokens_for_owner(&self, account_id: AccountId, from_index: Option<U128>, limit: Option<u64>) -> Vec<Token> {
        let original_tokens = self.tokens.nft_tokens_for_owner(account_id, from_index, limit);

        original_tokens.into_iter().map(|mut token| {
            self.enrich_token_with_card_data(&mut token);
            token
        }).collect()
    }

}

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    use super::*;

    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    #[test]
    fn test_new() {
        let mut context = get_context(accounts(1));
        testing_env!(context.build());
        let contract = Contract::new_default_meta(accounts(1).into());
        testing_env!(context.is_view(true).build());
        assert_eq!(contract.nft_token("1".to_string()), None);
    }

    #[test]
    #[should_panic(expected = "The contract is not initialized")]
    fn test_default() {
        let context = get_context(accounts(1));
        testing_env!(context.build());
        let _contract = Contract::default();
    }

    #[test]
    fn test_mint_random() {
        let account = AccountId::new_unchecked(MONSTERS_ALPHA_CONTRACT.into());
        let mut context = get_context(account.clone());
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(account.clone().into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(false)
            .attached_deposit(ONE_NEAR)
            .build());

        let card = contract.mint_random(1.into(), account.clone());
        assert!(card[0].token_id.ends_with("1"));
        let card = contract.mint_random(1.into(), account.clone());
        assert!(card[0].token_id.ends_with("2"));
        let card = contract.mint_random(1.into(), account.clone());
        assert!(card[0].token_id.ends_with("3"));
        let card = contract.mint_random(5.into(), account.clone());
        assert!(card[0].token_id.ends_with("4"));
        assert!(card[4].token_id.ends_with("8"));
        let card = contract.mint_random(16.into(), account.clone());
    }

    #[test]
    fn test_nft_tokens_enriched() {
        let account = AccountId::new_unchecked(MONSTERS_ALPHA_CONTRACT.into());
        let mut context = get_context(account.clone());
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(account.clone().into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(false)
            .attached_deposit(ONE_NEAR)
            .build());

        contract.mint_random(1.into(), account.clone());
        contract.mint_random(1.into(), account.clone());
        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .build());

        let card = &contract.nft_tokens(None, None)[0];
        assert!(card.metadata.clone().unwrap().title != None);
        assert!(card.metadata.clone().unwrap().description != None);
        assert!(card.metadata.clone().unwrap().extra != None);
        assert!(card.metadata.clone().unwrap().copies == Some(2));
    }

    #[test]
    fn test_full_set_listings() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        println!("{:?}", contract.full_set_listing());
        assert!(contract.full_set_listing().len() > 0);
    }
}
