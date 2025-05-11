/*
/// Module: fundx_nft
module fundx::fundx_nft;
*/

module fundx::fundx_nft {
    use sui::url::{Self, Url};
    use std::string::{String};
    use sui::table::{Self, Table};
    use sui::address::to_bytes;
    use sui::hash::{blake2b256};
    use sui::event;

    public struct FundXContributionNFT has key, store {
        id: UID,
        campaign_id: ID,
        name: String,
        image_url: Url,
        contributor: address,
        metadata_url: String,
    }

    public struct ContributionStore has key {
        id: UID,
        table: Table<vector<u8>, u64>,
    }

    public struct ContributionNFTMintedEvent has copy, drop, store {
        campaign: ID,
        contributor: address,
    }

    fun init(ctx: &mut TxContext) {
        let store = ContributionStore {
            id: object::new(ctx),
            table: table::new<vector<u8>, u64>(ctx),
        };

        transfer::share_object<ContributionStore>(store);
    }

    public fun make_key(campaign_id: &UID, contributor: address): vector<u8> {
        let mut bytes = vector::empty<u8>();
        vector::append(&mut bytes, object::uid_to_bytes(campaign_id));
        vector::append(&mut bytes, contributor.to_bytes());
        blake2b256(&bytes)
    }

    public fun mint_nft_or_update_store(
        campaign_id: &UID,
        amount: u64,
        name: String,
        image_url: String,
        metadata_url: String,
        contributor: address,
        store: &mut ContributionStore,
        ctx: &mut TxContext
    ) {
        let key: vector<u8> = make_key(campaign_id, contributor);

        if (table::contains(&store.table, key)) {
            let current_amount = table::remove(&mut store.table, key);
            table::add(&mut store.table,key, current_amount + amount);
        } else {
            let nft = FundXContributionNFT {
                id: object::new(ctx),
                campaign_id: object::uid_to_inner(campaign_id),
                name,
                contributor,
                image_url: url::new_unsafe_from_bytes(*image_url.as_bytes()),
                metadata_url,
            };

            table::add(&mut store.table, key, amount);

            let event = ContributionNFTMintedEvent {
                campaign: object::uid_to_inner(campaign_id),
                contributor,
            };

            transfer::public_transfer(nft, contributor);
            event::emit(event);
        };
    }

    public fun get_contribution_amount(
        store: &ContributionStore,
        campaign_id: &UID,
        contributor: address
    ): u64 {
        let key = make_key(campaign_id, contributor);

        let amount: &u64 = table::borrow(&store.table, key);
        *amount
    }

    public fun contributor(nft: &FundXContributionNFT): address {
        nft.contributor
    }

    public fun transfer_nft(campaign_id: &UID, nft: FundXContributionNFT, recipient: address, store: &mut ContributionStore, ctx: &mut TxContext) {
        let old_key = make_key(campaign_id, ctx.sender());
        let current_amount = table::remove(&mut store.table, old_key);
        let new_key = make_key(campaign_id, recipient);

        table::add(&mut store.table,new_key, current_amount);

        transfer::public_transfer(nft, recipient);
    }
}
