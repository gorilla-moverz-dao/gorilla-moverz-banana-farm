#[test_only]
module GorillaMoverz::banana_farm_e2e {
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_std::debug;
    use aptos_token_objects::collection::{Self, Collection};
    use std::option;
    use aptos_framework::object::{Self, Object};
    use std::signer;
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;
    use std::string;
    use aptos_token_objects::token;
    use minter::token_components;

    use GorillaMoverz::banana;
    use GorillaMoverz::banana_farm;
    use GorillaMoverz::launchpad;

    const EFUNDS_FROZEN: u64 = 7;
    const EFUNDS_NOT_FROZEN: u64 = 8;

    #[test(
        aptos_framework = @0x1, creator = @GorillaMoverz, allowlist_manager = @0x200, user1 = @0x300, user2 = @0x400
    )]
    #[expected_failure(abort_code = 327681, location = GorillaMoverz::banana)]
    fun test_basic_flow(
        aptos_framework: &signer,
        creator: &signer,
        allowlist_manager: &signer,
        user1: &signer,
        user2: &signer
    ) {
        let user1_address = signer::address_of(user1);
        let user2_address = signer::address_of(user2);

        let (main_collection, partner_collection) = test_setup_farm(aptos_framework, creator, allowlist_manager, user1);
        let nft = launchpad::test_mint_nft(user1_address, main_collection);

        debug::print(&main_collection);
        debug::print(&collection::creator(main_collection));
        debug::print(&collection::name(main_collection));
        debug::print(&collection::name(partner_collection));

        banana_farm::farm(user1, nft, vector[]);

        // Add user to allowlist and try to withdraw
        assert!(launchpad::is_allowlisted(user2_address, main_collection) == false, 1);
        launchpad::add_allowlist_addresses(allowlist_manager, vector[user2_address], main_collection);
        assert!(launchpad::is_allowlisted(user2_address, main_collection) == true, 2);
        let nft_user2 = launchpad::test_mint_nft(user2_address, main_collection);
        banana_farm::farm(user2, nft_user2, vector[]);

        // Transfer via banana module is disabled because user1 is not creator/owner
        GorillaMoverz::banana::transfer(user1, user1_address, user2_address, 1_000_000);
    }

    #[test(
        aptos_framework = @0x1, creator = @GorillaMoverz, allowlist_manager = @0x200, user1 = @0x300
    )]
    fun test_partner_boost(
        aptos_framework: &signer,
        creator: &signer,
        allowlist_manager: &signer,
        user1: &signer
    ) {
        let user1_address = signer::address_of(user1);

        let (main_collection, partner_collection) = test_setup_farm(aptos_framework, creator, allowlist_manager, user1);
        let nft = launchpad::test_mint_nft(user1_address, main_collection);
        let partner_nft = launchpad::test_mint_nft(user1_address, partner_collection);

        banana_farm::farm(user1, nft, vector[partner_nft]);

        let asset = banana::get_metadata();
        assert!(primary_fungible_store::balance(user1_address, asset) == 11_000_000_000, 6);
    }

    #[test(
        aptos_framework = @0x1, creator = @GorillaMoverz, allowlist_manager = @0x200, user1 = @0x300
    )]
    #[expected_failure(abort_code = banana_farm::EDUPLICATE_COLLECTION, location = banana_farm)]
    fun test_prevent_same_collection(
        aptos_framework: &signer,
        creator: &signer,
        allowlist_manager: &signer,
        user1: &signer
    ) {
        let user1_address = signer::address_of(user1);

        let (main_collection, partner_collection) = test_setup_farm(aptos_framework, creator, allowlist_manager, user1);
        let nft = launchpad::test_mint_nft(user1_address, main_collection);
        let partner_nft = launchpad::test_mint_nft(user1_address, partner_collection);

        banana_farm::farm(user1, nft, vector[nft, partner_nft]);
    }

    #[test(
        aptos_framework = @0x1, creator = @GorillaMoverz, thirdparty_creator = @0x200, allowlist_manager = @0x300, user1 = @0x400
    )]
    #[expected_failure(abort_code = banana_farm::EWRONG_COLLECTION, location = banana_farm)]
    fun test_verified_collections(
        aptos_framework: &signer,
        creator: &signer,
        thirdparty_creator: &signer,
        allowlist_manager: &signer,
        user1: &signer
    ) {
        let user1_address = signer::address_of(user1);

        let (main_collection, partner_collection) = test_setup_farm(aptos_framework, creator, allowlist_manager, user1);
        let nft = launchpad::test_mint_nft(user1_address, main_collection);
        let partner_nft = launchpad::test_mint_nft(user1_address, partner_collection);

        // Add partner collection as verified
        let partner_collection_address = object::object_address(&partner_collection);
        banana_farm::add_verified_collection(creator, partner_collection_address);

        // Farm with partner NFT - should work and give boost
        banana_farm::farm(user1, nft, vector[partner_nft]);

        let asset = banana::get_metadata();
        assert!(primary_fungible_store::balance(user1_address, asset) == 11_000_000_000, 1);

        // Create two collections directly through token module (not through launchpad)
        let verified_collection_constructor_ref = &collection::create_fixed_collection(
            thirdparty_creator,
            string::utf8(b"verified description"),
            10,
            string::utf8(b"verified"),
            option::none(),
            string::utf8(b"https://example.com/verified.json")
        );
        let verified_collection = object::object_from_constructor_ref<Collection>(verified_collection_constructor_ref);
        let verified_nft_constructor_ref = &token::create(
            thirdparty_creator,
            string::utf8(b"verified"),
            string::utf8(b"1"),
            string::utf8(b"1"),
            option::none(),
            string::utf8(b"https://example.com/verified/1.json")
        );
        token_components::create_refs(verified_nft_constructor_ref);
        let verified_nft = object::object_from_constructor_ref<aptos_token_objects::token::Token>(verified_nft_constructor_ref);
        object::transfer(thirdparty_creator, verified_nft, user1_address);

        let non_verified_collection_constructor_ref = &collection::create_fixed_collection(
            thirdparty_creator,
            string::utf8(b"non verified description"),
            10,
            string::utf8(b"non verified"),
            option::none(),
            string::utf8(b"https://example.com/non-verified.json")
        );
        object::object_from_constructor_ref<Collection>(non_verified_collection_constructor_ref);
        let non_verified_nft_constructor_ref = &token::create(
            thirdparty_creator,
            string::utf8(b"non verified"),
            string::utf8(b"1"),
            string::utf8(b"1"),
            option::none(),
            string::utf8(b"https://example.com/non-verified/1.json")
        );
        token_components::create_refs(non_verified_nft_constructor_ref);
        let non_verified_nft = object::object_from_constructor_ref<aptos_token_objects::token::Token>(non_verified_nft_constructor_ref);
        object::transfer(thirdparty_creator, non_verified_nft, user1_address);

        // Add verified collection to the verified list
        let verified_collection_address = object::object_address(&verified_collection);
        banana_farm::add_verified_collection(creator, verified_collection_address);

        // Update timestamp to allow farming again
        timestamp::update_global_time_for_test_secs(650);

        // Farm with verified NFT - should work and give boost
        banana_farm::farm(user1, nft, vector[verified_nft]);

        let asset = banana::get_metadata();
        assert!(primary_fungible_store::balance(user1_address, asset) == 22_000_000_000, 2);

        // Update timestamp to allow farming again
        timestamp::update_global_time_for_test_secs(850);

        // This should fail with EWRONG_COLLECTION
        banana_farm::farm(user1, nft, vector[non_verified_nft]);
    }

    #[test(
        aptos_framework = @0x1, creator = @GorillaMoverz, allowlist_manager = @0x200, user1 = @0x300, user2 = @0x400
    )]
    #[expected_failure(abort_code = 327681, location = GorillaMoverz::banana)]
    fun test_frozen_banana_transfer_disabled(
        aptos_framework: &signer,
        creator: &signer,
        allowlist_manager: &signer,
        user1: &signer,
        user2: &signer
    ) {
        let user1_address = signer::address_of(user1);
        let user2_address = signer::address_of(user2);

        let (main_collection, _partner_collection) = test_setup_farm(aptos_framework, creator, allowlist_manager, user1);
        let nft = launchpad::test_mint_nft(user1_address, main_collection);
        let asset = GorillaMoverz::banana::get_metadata();

        assert!(!primary_fungible_store::is_frozen(user1_address, asset), EFUNDS_FROZEN);
        banana_farm::farm(user1, nft, vector[]); // Should work for frozen account
        assert!(primary_fungible_store::is_frozen(user1_address, asset), EFUNDS_NOT_FROZEN);

        let balance = primary_fungible_store::balance(user1_address, asset);
        debug::print(&balance);
        assert!(primary_fungible_store::balance(user1_address, asset) == 10_000_000_000, 6);

        // Withdraw again, should work even though funds are frozen.
        timestamp::update_global_time_for_test_secs(650);
        banana_farm::farm(user1, nft, vector[]);
        // Transfer via banana module is disabled because user1 is not creator/owner
        GorillaMoverz::banana::transfer(user1, user1_address, user2_address, 1_000_000);
    }

    #[test(
        aptos_framework = @0x1, creator = @GorillaMoverz, allowlist_manager = @0x200, user1 = @0x300, user2 = @0x400
    )]
    #[expected_failure(abort_code = 327683, location = aptos_framework::fungible_asset)]
    fun test_frozen_fa_transfer_disabled(
        aptos_framework: &signer,
        creator: &signer,
        allowlist_manager: &signer,
        user1: &signer,
        user2: &signer
    ) {
        let user1_address = signer::address_of(user1);
        let user2_address = signer::address_of(user2);

        let (main_collection, _partner_collection) = test_setup_farm(aptos_framework, creator, allowlist_manager, user1);
        let nft = launchpad::test_mint_nft(user1_address, main_collection);
        let asset = GorillaMoverz::banana::get_metadata();

        assert!(!primary_fungible_store::is_frozen(user1_address, asset), EFUNDS_FROZEN);
        banana_farm::farm(user1, nft, vector[]); // Should work for frozen account
        assert!(primary_fungible_store::is_frozen(user1_address, asset), EFUNDS_NOT_FROZEN);

        let balance = primary_fungible_store::balance(user1_address, asset);
        debug::print(&balance);
        assert!(primary_fungible_store::balance(user1_address, asset) == 10_000_000_000, 6);

        // Transfer via fungible_asset is disabled due to freeze
        let user1_wallet = primary_fungible_store::primary_store(user1_address, asset);
        let user2_wallet = primary_fungible_store::ensure_primary_store_exists(user2_address, asset);
        fungible_asset::transfer(user1, user1_wallet, user2_wallet, 1_000_000);
    }

    #[test(
        aptos_framework = @0x1, creator = @GorillaMoverz, allowlist_manager = @0x200, user1 = @0x300
    )]
    #[expected_failure(abort_code = banana_farm::EWRONG_COLLECTION, location = banana_farm)]
    fun test_wrong_main_nft(
        aptos_framework: &signer,
        creator: &signer,
        allowlist_manager: &signer,
        user1: &signer
    ) {
        let user1_address = signer::address_of(user1);

        let (_main_collection, partner_collection) = test_setup_farm(aptos_framework, creator, allowlist_manager, user1);
        let partner_nft = launchpad::test_mint_nft(user1_address, partner_collection);

        banana_farm::farm(user1, partner_nft, vector[]);
    }

    #[test_only]
    fun test_setup_farm(
        aptos_framework: &signer,
        creator: &signer,
        allowlist_manager: &signer,
        user1: &signer
    ): (Object<Collection>, Object<Collection>) {
        let creator_address = signer::address_of(creator);
        account::create_account_for_test(creator_address);

        let user1_address = signer::address_of(user1);
        account::create_account_for_test(user1_address);

        let allowlist_manager_address = signer::address_of(allowlist_manager);

        banana::test_init(creator);

        banana::mint(creator, creator_address, 200_000_000_000);

        banana_farm::test_init(creator);

        banana_farm::deposit(creator, 200_000_000_000);

        launchpad::test_init(creator);
        let (main_collection, partner_collection) =
            launchpad::test_setup_banana_farmer(
                aptos_framework,
                creator,
                allowlist_manager_address,
                option::some(vector[user1_address])
            );

        let collection_address = object::object_address(&main_collection);
        banana_farm::set_collection_address(creator, collection_address);

        (main_collection, partner_collection)
    }
}

