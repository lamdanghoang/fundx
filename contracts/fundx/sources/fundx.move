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
    const EActiveCampaign: u64 = 2;
    const EExpiredCampaign: u64 = 3;
    const EPausedCampaign: u64 = 4;
    const ENotContributor: u64 = 5;
    const EMilestoneInvalid: u64 = 6;
    const ENotReachGoal: u64 = 7;
    const EMilestoneAlreadyVoted: u64 = 8;
    const EMilestoneNotVoted: u64 = 9;
    const EMilestoneNotApproved: u64 = 10;
    const EInvalidPercentage: u64 = 11;
    const EMilestoneAmountOverflow: u64 = 12;
    const EMilestoneAlreadyReleased: u64 = 13;
    const EMilestoneAlreadyApproved: u64 = 14;

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
        duration: u64,
        deadline: u64,
        admin: address,
        status: u8, // 0 = active, 1 = paused, 2 = deleted
        quorum_percentage: u64,
        contributors: vec_map::VecMap<address, u64>, // address => amount
        milestones: vec_map::VecMap<u64, bool>, // milestone_id => approved
        milestone_amounts: vec_map::VecMap<u64, u64>, // milestone_id => amount
        milestone_votes: vec_map::VecMap<u64, vec_map::VecMap<address, bool>>, // milestone_id => (voter => true)
        milestone_vote_weights: vec_map::VecMap<u64, u64>, // milestone_id => total_vote_weight
        released_milestones: vec_map::VecMap<u64, bool>, // track milestone released or not
    }

    public struct Admin has key {
        id: UID,
    }

    public struct CampaignCreatedEvent has copy, drop, store {
        campaign_id: ID,
        blob_id: vector<u8>,
        creator: address,
    }

    public struct PercentageChangedEvent has copy, drop, store {
        campaign_id: ID,
        old_percentage: u64,
        new_percentage: u64,
        signer: address,
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

    public struct MileStoneAmountApprovedEvent has copy, drop, store {
        campaign_id: ID,
        milestone_id: u64,
        amount: u64,
    }

    public struct MilestoneApprovedEvent has copy, drop, store {
        campaign_id: ID,
        milestone_id: u64,
        amount: u64,
    }

    public struct MilestoneVotedEvent has copy, drop, store {
        campaign_id: ID,
        milestone_id: u64,
        voter: address,
        choice: bool,
    }

    public struct MilestoneRevokedVoteEvent has copy, drop, store {
        campaign_id: ID,
        milestone_id: u64,
        voter: address,
    }

    public struct SetMilestoneAmountEvent has copy, drop, store {
        campaign_id: ID,
        milestone_id: u64,
        amount: u64,
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
            duration,
            deadline: clock::timestamp_ms(clock) + duration * 1000,
            admin: @admin,
            status: 0,
            quorum_percentage: 66,
            contributors: vec_map::empty<address, u64>(),
            milestones: vec_map::empty<u64, bool>(),
            milestone_amounts: vec_map::empty<u64, u64>(),
            milestone_votes: vec_map::empty<u64, vec_map::VecMap<address, bool>>(),
            milestone_vote_weights: vec_map::empty<u64, u64>(),
            released_milestones: vec_map::empty<u64, bool>(),
        };

        let event = CampaignCreatedEvent {
            campaign_id: object::id(&new_campaign),
            blob_id: string::into_bytes(blob_id_str),
            creator: ctx.sender(),
        };

        transfer::share_object<Campaign>(new_campaign);
        event::emit<CampaignCreatedEvent>(event);
    }

    public entry fun change_quorum_percentage(_: &Admin, campaign: &mut Campaign, percentage: u64, ctx: &mut TxContext) {
        assert!(percentage > 50 && percentage <= 100, EInvalidPercentage);
        let current = campaign.quorum_percentage;
        campaign.quorum_percentage = percentage;

        let event = PercentageChangedEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            old_percentage: current,
            new_percentage: percentage,
            signer: ctx.sender(),
        };

        event::emit(event);
    }

    public entry fun delete_campaign(_: &Admin, campaign: &mut Campaign) {
        campaign.status = 2;
    }

    public entry fun pause_campaign(_: &Admin, campaign: &mut Campaign) {
        campaign.status = 1;
    }

    public entry fun resume_campaign(_: &Admin, campaign: &mut Campaign) {
        campaign.status = 0;
    }

    public entry fun contribute(campaign: &mut Campaign, coin: Coin<SUI>, amount: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(clock::timestamp_ms(clock) < campaign.deadline, EExpiredCampaign);
        assert!(campaign.status == 0, EPausedCampaign);
                
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

    public entry fun approve_milestone_amount(_: &Admin, campaign: &mut Campaign, milestone_id: u64, amount: u64) {
        assert!(!vec_map::contains(&campaign.milestone_amounts, &milestone_id), EMilestoneAlreadyApproved);
        assert!(amount > 0 && amount <= balance::value(&campaign.balance), EInsufficientBalance);

        vec_map::insert(&mut campaign.milestone_amounts, milestone_id, amount);

        let event = MileStoneAmountApprovedEvent {
            campaign_id:  object::uid_to_inner(&campaign.id),
            milestone_id,
            amount,
        };

        event::emit(event);
    }

    public entry fun approve_milestone_id(_: &Admin, campaign: &mut Campaign, milestone_id: u64, amount: u64) {
        assert!(!vec_map::contains(&campaign.milestone_amounts, &milestone_id), EMilestoneAlreadyApproved);
        assert!(amount > 0 && amount <= balance::value(&campaign.balance), EInsufficientBalance);

        vec_map::insert(&mut campaign.milestones, milestone_id, true);
        vec_map::insert(&mut campaign.milestone_amounts, milestone_id, amount);

        let event = MilestoneApprovedEvent {
            campaign_id:  object::uid_to_inner(&campaign.id),
            milestone_id,
            amount,
        };

        event::emit(event);
    }

    public entry fun vote_milestone(campaign: &mut Campaign, milestone_id: u64, choice: bool, clock: &Clock, ctx: &mut TxContext) {
        assert!(clock::timestamp_ms(clock ) > campaign.deadline, EActiveCampaign);
        assert!(!vec_map::contains(&campaign.released_milestones, &milestone_id), EMilestoneAlreadyReleased);
        let is_contributor = vec_map::contains(&campaign.contributors, &ctx.sender());
        assert!(is_contributor, ENotContributor);

        // Check voted or not
        let votes = if (vec_map::contains(&campaign.milestone_votes, &milestone_id)) {
            vec_map::get_mut(&mut campaign.milestone_votes, &milestone_id)
        } else {
            let new_map = vec_map::empty<address, bool>();
            vec_map::insert(&mut campaign.milestone_votes, milestone_id, new_map);
            vec_map::get_mut(&mut campaign.milestone_votes, &milestone_id)
        };

        let already_voted = vec_map::contains(votes, &ctx.sender());
        assert!(!already_voted, EMilestoneAlreadyVoted);

        vec_map::insert(votes, ctx.sender(), choice);

        // Vote weight
        let amount = *vec_map::get(&campaign.contributors, &ctx.sender());
        let total_weight = if (vec_map::contains(&campaign.milestone_vote_weights, &milestone_id)) {
            vec_map::get_mut(&mut campaign.milestone_vote_weights, &milestone_id)
        } else {
            vec_map::insert(&mut campaign.milestone_vote_weights, milestone_id, 0);
            vec_map::get_mut(&mut campaign.milestone_vote_weights, &milestone_id)
        };
        *total_weight = *total_weight + amount;

        let event = MilestoneVotedEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            milestone_id,
            voter: ctx.sender(),
            choice,
        };

        event::emit(event);
    }

    public entry fun revoke_vote(campaign: &mut Campaign, milestone_id: u64, ctx: &mut TxContext) {
        let is_contributor = vec_map::contains(&campaign.contributors, &ctx.sender());
        assert!(is_contributor, ENotContributor);

        let votes = vec_map::get_mut(&mut campaign.milestone_votes, &milestone_id);
        let already_voted = vec_map::contains(votes, &ctx.sender());
        assert!(already_voted, EMilestoneNotVoted);

        let amount = *vec_map::get(&campaign.contributors, &ctx.sender());
        let current_weight = *vec_map::get(&campaign.milestone_vote_weights, &milestone_id);
        vec_map::insert(&mut campaign.milestone_vote_weights, milestone_id, current_weight - amount);
        vec_map::remove(votes, &ctx.sender());

        let event = MilestoneRevokedVoteEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            milestone_id,
            voter: ctx.sender(),
        };

        event::emit(event);
    }

    public entry fun set_milestone_amount(_: &Admin, campaign: &mut Campaign, milestone_id: u64, amount: u64) {
        vec_map::insert(&mut campaign.milestone_amounts, milestone_id, amount);

        let mut keys = vec_map::keys(&campaign.milestone_amounts);
        let mut total = 0u64;
        while (!vector::is_empty(&keys)) {
            let id = vector::pop_back(&mut keys);
            if (id != milestone_id) {
                total = total + *vec_map::get(&campaign.milestone_amounts, &milestone_id);
            };
        };
        assert!(total + amount <= campaign.raised, EMilestoneAmountOverflow);

        let event = SetMilestoneAmountEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            milestone_id,
            amount,
        };

        event::emit(event);
    }

    public entry fun release_funds(_: &Admin, campaign: &mut Campaign, milestone: u64, amount: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(clock::timestamp_ms(clock) > campaign.deadline, EActiveCampaign);
        assert!(vec_map::contains(&campaign.milestones, &milestone) && *vec_map::get(&campaign.milestones, &milestone), EMilestoneInvalid);
        assert!(!vec_map::contains(&campaign.released_milestones, &milestone), EMilestoneAlreadyReleased);
        assert!(balance::value(&campaign.balance) >= amount, EInsufficientBalance);

        // Check votes >= quorum_percentage
        let votes_weight = *vec_map::get(&campaign.milestone_vote_weights, &milestone);
        assert!(votes_weight * 100 >= campaign.raised * campaign.quorum_percentage, EMilestoneNotApproved);

        let fee_amount = amount * 5 / 100;
        let mut total_coin = coin::take<SUI>(&mut campaign.balance, amount, ctx);
        
        let fee_coin = coin::split<SUI>(&mut total_coin, fee_amount, ctx);

        transfer::public_transfer(total_coin, campaign.creator);
        transfer::public_transfer(fee_coin, campaign.admin);
        
        vec_map::insert(&mut campaign.released_milestones, milestone, true);

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

    public entry fun claim_milestone_fund(campaign: &mut Campaign, milestone_id: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(campaign.creator == ctx.sender(), ENotContributor);
        assert!(clock::timestamp_ms(clock) > campaign.deadline, EActiveCampaign);
        assert!(vec_map::contains(&campaign.milestones, &milestone_id) && *vec_map::get(&campaign.milestones, &milestone_id), EMilestoneInvalid);
        assert!(!vec_map::contains(&campaign.released_milestones, &milestone_id), EMilestoneAlreadyReleased);

        let amount = *vec_map::get(&campaign.milestone_amounts, &milestone_id);
        assert!(balance::value(&campaign.balance) >= amount, EInsufficientBalance);

        // Check if vote weight meets quorum
        let votes_weight = *vec_map::get(&campaign.milestone_vote_weights, &milestone_id);
        assert!(votes_weight * 100 >= campaign.raised * campaign.quorum_percentage, EMilestoneNotApproved);

        let fee_amount = amount * 5 / 100;
        let mut total_coin = coin::take<SUI>(&mut campaign.balance, amount, ctx);
        let fee_coin = coin::split<SUI>(&mut total_coin, fee_amount, ctx);

        transfer::public_transfer(total_coin, campaign.creator);
        transfer::public_transfer(fee_coin, campaign.admin);

        vec_map::insert(&mut campaign.released_milestones, milestone_id, true);

        let fund_event = FundReleaseEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            recipient: campaign.creator,
            milestone: milestone_id,
            amount,
        };

        let fee_event = FeeCollectedEvent {
            campaign_id: object::uid_to_inner(&campaign.id),
            platform_address: campaign.admin,
            milestone: milestone_id,
            amount: fee_amount,
        };

        event::emit(fund_event);
        event::emit(fee_event);
    }
}
