/*
/// Module: fundx
module fundx::fundx;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module fundx::fundx {

    use std::string::{String, Self};
    use sui::balance;
    use sui::sui::SUI;
    use sui::coin::{Coin, Self};
    use sui::vec_map;
    use sui::clock::{Clock, Self};
    use sui::event;

    const EInsufficientBalance: u64 = 1;
    const ENotExpiredCampaign: u64 = 2;
    const EExpiredCampaign: u64 = 3;
    const EActiveCampaign: u64 = 4;
    const ENotContributor: u64 = 5;
    const EMilestoneInvalid: u64 = 6;
    const ENotReachGoal: u64 = 7;

    public struct FundX has key {
        id: UID,
        name: String,
    }

    public struct Campaign has store, key {
        id: UID,
        blob_id: vector<u8>,
        creator: address,
        goal: u64,
        raised: u64,
        balance: balance::Balance<SUI>,
        deadline: u64,
        milestones: vec_map::VecMap<u64, bool>,
        admin: address,
        contributors: vec_map::VecMap<address, u64>,
    }

    public struct Admin has key {
        id: UID,
    }

    public struct CampaignCreatedEvent has copy, drop, store {
        campaign_id: ID,
        blob_id: vector<u8>,
        creator: address,
    }

    public struct ContributionEvent has copy, drop, store {
        campaign_id: ID,
        contributor: address,
        amount: u64,
    }

    public struct RefundEvent has copy, drop, store {
        campaign_id: ID,
        recipient: address,
        amount: u64,
    }

    public struct RefundAllEvent has copy, drop, store {
        campaign_id: ID,
        amount: u64,
        total_recipients: u64,
    }

    public struct MileStoneApprovedEvent has copy, drop, store {
        campaign_id: ID,
        milestone_id: u64,
    }

    public struct FundReleaseEvent has copy, drop, store {
        campaign_id: ID,
        recipient: address,
        milestone: u64,
        amount: u64,
    }

    public struct FeeCollectedEvent has copy, drop, store {
        campaign_id: ID,
        platform_address: address,
        milestone: u64,
        amount: u64,
    }
    
    fun init(ctx: &mut TxContext) {
        let obj: FundX = FundX { 
            id: object::new(ctx), 
            name: b"FundX Contract".to_string()
        };

        transfer::share_object(obj);
        
        let admin: Admin = Admin { id: object::new(ctx) };

        transfer::transfer(admin, ctx.sender());
    }

    public entry fun create_campaign(blob_id_str: String, goal: u64, duration: u64, clock: &Clock, ctx: &mut TxContext) {
        let new_campaign = Campaign {
            id: object::new(ctx),
            blob_id: string::into_bytes(blob_id_str),
            creator: ctx.sender(),
            goal,
            raised: 0,
            balance: balance::zero<SUI>(),
            deadline: clock::timestamp_ms(clock) + duration * 1000,
            milestones: vec_map::empty<u64, bool>(),
            admin: @admin,
            contributors: vec_map::empty<address, u64>()
        };

        let event = CampaignCreatedEvent {
            campaign_id: object::id(&new_campaign),
            blob_id: string::into_bytes(blob_id_str),
            creator: ctx.sender(),
        };

        transfer::share_object<Campaign>(new_campaign);
        event::emit<CampaignCreatedEvent>(event);
    }

    public entry fun contribute(campaign: &mut Campaign, coin: Coin<SUI>, amount: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(clock::timestamp_ms(clock) < campaign.deadline, EExpiredCampaign);
                
        let coin_value = coin.value();
        assert!(coin_value >= amount, EInsufficientBalance);

        let mut user_balance = coin.into_balance();

        if (coin_value == amount) {
            balance::join<SUI>(&mut campaign.balance, user_balance);
        } else {
            let split_balance = balance::split<SUI>(&mut user_balance, amount);
            balance::join(&mut campaign.balance, split_balance);
            let remaining_coin = coin::from_balance(user_balance, ctx);
            transfer::public_transfer(remaining_coin, ctx.sender());
        };

        campaign.raised = campaign.raised + amount;

        let is_exist: bool = vec_map::contains(&campaign.contributors, &ctx.sender());

        if (!is_exist) {
            vec_map::insert(&mut campaign.contributors, ctx.sender(), amount);
        } else {
            let current_amount = vec_map::get_mut(&mut campaign.contributors, &ctx.sender());
            *current_amount = *current_amount + amount;
        };

        let event = ContributionEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            contributor: ctx.sender(),
            amount,
        };

        event::emit<ContributionEvent>(event);
    }

    public entry fun refund(campaign: &mut Campaign, clock: &Clock, ctx: &mut TxContext) {
        assert!(clock::timestamp_ms(clock) > campaign.deadline, EActiveCampaign);
        assert!(campaign.raised < campaign.goal, ENotReachGoal);

        let is_contributor = vec_map::contains(&campaign.contributors, &ctx.sender());

        assert!(is_contributor, ENotContributor);

        let (_, amount) = vec_map::remove(&mut campaign.contributors, &ctx.sender());
        let cash = coin::take(&mut campaign.balance, amount, ctx);
        transfer::public_transfer(cash, ctx.sender());

        let event = RefundEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            recipient: ctx.sender(),
            amount,
        };

        event::emit(event);
    }

    public entry fun refund_all(_: &Admin, campaign: &mut Campaign, clock: &Clock, ctx: &mut TxContext) {
        assert!(clock::timestamp_ms(clock) > campaign.deadline, EActiveCampaign);
        assert!(campaign.raised < campaign.goal, ENotReachGoal);

        let mut list = vec_map::keys(&campaign.contributors);
        let mut refunded_count = 0u64;
        let mut total_refunded = 0u64;

        while (!vector::is_empty(&list)) {
            let addr = vector::pop_back(&mut list);
            let (_, amount) = vec_map::remove(&mut campaign.contributors, &addr);
            let cash = coin::take(&mut campaign.balance, amount, ctx);
            transfer::public_transfer(cash, addr);
            refunded_count = refunded_count + 1;
            total_refunded = total_refunded + amount;
        };

        campaign.raised = 0;

        let event = RefundAllEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            amount: total_refunded,
            total_recipients: refunded_count,
        };

        event::emit(event);
    }

    public entry fun approve_milestone(_: &Admin, campaign: &mut Campaign, milestone_id: u64) {
        vec_map::insert(&mut campaign.milestones, milestone_id, true);

        let event = MileStoneApprovedEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            milestone_id
        };

        event::emit(event);
    }

    public entry fun release_funds(_: &Admin, campaign: &mut Campaign, milestone: u64, amount: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(clock::timestamp_ms(clock) < campaign.deadline, ENotExpiredCampaign);
        assert!(vec_map::contains(&campaign.milestones, &milestone) && *vec_map::get(&campaign.milestones, &milestone), EMilestoneInvalid);
        assert!(balance::value(&campaign.balance) >= amount, EInsufficientBalance);

        let fee_amount = amount * 5 / 100;
        let mut total_coin = coin::take<SUI>(&mut campaign.balance, amount, ctx);
        
        let fee_coin = coin::split<SUI>(&mut total_coin, fee_amount, ctx);

        transfer::public_transfer(total_coin, campaign.creator);
        transfer::public_transfer(fee_coin, campaign.admin);

        let fund_event = FundReleaseEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            recipient: campaign.creator,
            milestone,
            amount,
        };

        let fee_event = FeeCollectedEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            platform_address: campaign.admin,
            milestone,
            amount: fee_amount,
        };

        event::emit(fund_event);
        event::emit(fee_event);
    }
}
