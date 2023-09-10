use near_contract_standards::fungible_token::metadata::{
    FungibleTokenMetadata, FungibleTokenMetadataProvider, FT_METADATA_SPEC,
};
use near_contract_standards::fungible_token::{
    FungibleToken, FungibleTokenCore, FungibleTokenResolver,
};
use near_contract_standards::storage_management::{
    StorageBalance, StorageBalanceBounds, StorageManagement,
};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::json_types::U128;
use near_sdk::{
    env, log, near_bindgen, require, AccountId, BorshStorageKey, PanicOnDefault, Balance, Promise, PromiseOrValue, ONE_NEAR, serde_json, Gas
};

#[cfg(feature = "use_prod_chain")]
const MONSTERS_NFT_CONTRACT: &str = "monsters_nfts.near";

#[cfg(not(feature = "use_prod_chain"))]
const MONSTERS_NFT_CONTRACT: &str = "dev-1693936211939-67386471331489";

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    token: FungibleToken,
    metadata: LazyOption<FungibleTokenMetadata>,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 288 288'%3E%3Cg id='l' data-name='l'%3E%3Cpath d='M187.58,79.81l-30.1,44.69a3.2,3.2,0,0,0,4.75,4.2L191.86,103a1.2,1.2,0,0,1,2,.91v80.46a1.2,1.2,0,0,1-2.12.77L102.18,77.93A15.35,15.35,0,0,0,90.47,72.5H87.34A15.34,15.34,0,0,0,72,87.84V201.16A15.34,15.34,0,0,0,87.34,216.5h0a15.35,15.35,0,0,0,13.08-7.31l30.1-44.69a3.2,3.2,0,0,0-4.75-4.2L96.14,186a1.2,1.2,0,0,1-2-.91V104.61a1.2,1.2,0,0,1,2.12-.77l89.55,107.23a15.35,15.35,0,0,0,11.71,5.43h3.13A15.34,15.34,0,0,0,216,201.16V87.84A15.34,15.34,0,0,0,200.66,72.5h0A15.35,15.35,0,0,0,187.58,79.81Z'/%3E%3C/g%3E%3C/svg%3E";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    FungibleToken,
    Metadata,
}

#[near_bindgen]
impl Contract {
    const CARDS_PER_PACK: U128 = U128(5);
    const TOTAL_SUPPLY: U128 = U128(25000);
    const NEAR_COST_PER_PACK: u128 = 4*ONE_NEAR;
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        Self::new(
            owner_id,
            FungibleTokenMetadata {
                spec: FT_METADATA_SPEC.to_string(),
                name: "NEAR Monsters ALPHA packs".to_string(),
                symbol: "MONSTERS_ALPHA".to_string(),
                icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()), //TODO
                reference: None,
                reference_hash: None,
                decimals: 0,
            },
        )
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: FungibleTokenMetadata) -> Self {
        require!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        let mut this = Self {
            token: FungibleToken::new(StorageKey::FungibleToken),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
        };
        let total_supply = Self::TOTAL_SUPPLY;
        this.token.internal_register_account(&owner_id);
        this.token.internal_deposit(&owner_id, total_supply.into());

        near_contract_standards::fungible_token::events::FtMint {
            owner_id: &owner_id,
            amount: &total_supply,
            memo: Some("ALPHA has been created."),
        }
        .emit();

        this
    }

    #[payable]
    pub fn purchase(&mut self) {
        let buyer_id = env::predecessor_account_id();
        let buyer_deposit = env::attached_deposit();
        let num_packs = buyer_deposit / Self::NEAR_COST_PER_PACK;
        assert!(num_packs > 0, "You must purchase at least 1 pack at {} NEAR per pack.", Self::NEAR_COST_PER_PACK / ONE_NEAR);
        let refund_amount = buyer_deposit % Self::NEAR_COST_PER_PACK;
        let sender_id = env::current_account_id();
        log!("Sending {} packs from {} to {}", num_packs, buyer_id, sender_id);
        let amount: Balance = num_packs.into();
        let memo = format!("Purchase of {} MONSTER ALPHA packs for {} NEAR", num_packs, num_packs * Self::NEAR_COST_PER_PACK / ONE_NEAR);
        log!(memo);
        
        self.token.internal_transfer(&sender_id, &buyer_id, amount, Some(memo));
        log!("Sent {} packs with {} refund", num_packs, refund_amount);
        if refund_amount > 0 {
            Promise::new(buyer_id.clone())
                .transfer(refund_amount);
        }
    }

    #[payable]
    pub fn open_pack(&mut self) {
        let num_packs = U128(1); //Limit to 1 for now
        let sender_id = &env::predecessor_account_id();
        let receiver_id = AccountId::new_unchecked("system".into());
        let mint_gas = env::prepaid_gas() - Gas(100000000000000); //TODO

        let memo = "Open pack";
        self.token.internal_transfer(&sender_id, &receiver_id, num_packs.into(), Some(memo.into()));
        let mint_promise = env::promise_create(
            AccountId::new_unchecked(MONSTERS_NFT_CONTRACT.into()),
            "mint_random",
            &serde_json::to_vec(&(Self::CARDS_PER_PACK,sender_id)).unwrap(),
            6240000000000000000000,
            mint_gas,
        );
        env::promise_return(mint_promise)
    }
}

#[near_bindgen]
impl FungibleTokenCore for Contract {
    #[payable]
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>) {
        self.token.ft_transfer(receiver_id, amount, memo)
    }

    #[payable]
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128> {
        self.token.ft_transfer_call(receiver_id, amount, memo, msg)
    }

    fn ft_total_supply(&self) -> U128 {
        self.token.ft_total_supply()
    }

    fn ft_balance_of(&self, account_id: AccountId) -> U128 {
        self.token.ft_balance_of(account_id)
    }
}

#[near_bindgen]
impl FungibleTokenResolver for Contract {
    #[private]
    fn ft_resolve_transfer(
        &mut self,
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: U128,
    ) -> U128 {
        let (used_amount, burned_amount) =
            self.token.internal_ft_resolve_transfer(&sender_id, receiver_id, amount);
        if burned_amount > 0 {
            log!("Account @{} burned {}", sender_id, burned_amount);
        }
        used_amount.into()
    }
}

#[near_bindgen]
impl StorageManagement for Contract {
    #[payable]
    fn storage_deposit(
        &mut self,
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance {
        self.token.storage_deposit(account_id, registration_only)
    }

    #[payable]
    fn storage_withdraw(&mut self, amount: Option<U128>) -> StorageBalance {
        self.token.storage_withdraw(amount)
    }

    #[payable]
    fn storage_unregister(&mut self, force: Option<bool>) -> bool {
        #[allow(unused_variables)]
        if let Some((account_id, balance)) = self.token.internal_storage_unregister(force) {
            log!("Closed @{} with {}", account_id, balance);
            true
        } else {
            false
        }
    }

    fn storage_balance_bounds(&self) -> StorageBalanceBounds {
        self.token.storage_balance_bounds()
    }

    fn storage_balance_of(&self, account_id: AccountId) -> Option<StorageBalance> {
        self.token.storage_balance_of(account_id)
    }
}

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().unwrap()
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::{testing_env, Balance};

    use super::*;

    const TOTAL_SUPPLY: Balance = 25000;

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
        assert_eq!(contract.ft_total_supply().0, TOTAL_SUPPLY);
        assert_eq!(contract.ft_balance_of(accounts(1)).0, TOTAL_SUPPLY);
    }

    #[test]
    #[should_panic(expected = "The contract is not initialized")]
    fn test_default() {
        let context = get_context(accounts(1));
        testing_env!(context.build());
        let _contract = Contract::default();
    }

    #[test]
    fn test_transfer() {
        let mut context = get_context(accounts(2));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(2).into());
        testing_env!(context
                     .storage_usage(env::storage_usage())
                     .attached_deposit(contract.storage_balance_bounds().min.into())
                     .predecessor_account_id(accounts(1))
                     .build());
        // Paying for account registration, aka storage deposit
        contract.storage_deposit(None, None);

        testing_env!(context
                     .storage_usage(env::storage_usage())
                     .attached_deposit(1)
                     .predecessor_account_id(accounts(2))
                     .build());
        let transfer_amount = TOTAL_SUPPLY / 3;
        contract.ft_transfer(accounts(1), transfer_amount.into(), None);

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        assert_eq!(contract.ft_balance_of(accounts(2)).0, (TOTAL_SUPPLY - transfer_amount));
        assert_eq!(contract.ft_balance_of(accounts(1)).0, transfer_amount);
    }

    #[test]
    #[should_panic(expected ="You must purchase at least 1 pack at 4 NEAR per pack.")]
    fn test_purchase() {
        let mut context = get_context(accounts(3));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(3).into());
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(0)
            .predecessor_account_id(accounts(1))
            .build());
        contract.purchase();
    }

    #[test]
    fn test_purchase_one() {
        let buyer_account = accounts(1);
        let contract_account = accounts(0);
        let mut context = get_context(buyer_account.clone());
        testing_env!(context.build());
        let mut contract:Contract = Contract::new_default_meta(contract_account.clone()).into();
        let refund_amount = 9;

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(4*ONE_NEAR + refund_amount)
            .predecessor_account_id(buyer_account.clone())
            .build());
        contract.storage_deposit(Some(buyer_account.clone()), None);
        contract.purchase();
        assert_eq!(contract.ft_balance_of(buyer_account.clone()), U128(1));
        assert_eq!(contract.ft_balance_of(contract_account.clone()), U128(24999));
    }

}
