module fundx::governance {

    use sui::table::{Table, Self};
    use std::string::{String};
    use fundx::fundx::{Campaign, Self as fundx};
    use sui::clock::Clock;
    use sui::clock;
    use fundx::fundx_nft::{FundXContributionNFT, ContributionStore};
    use fundx::fundx_nft::contains_key;
    use fundx::fundx_nft::get_contribution_amount;
    use sui::vec_map;
    use sui::event;
    use fundx::fundx::is_milestone_voted;

    public struct Proposal has key, store {
        id: UID,
        proposal_id: u64,
        campaign_id: ID,
        milestone_id: u64,
        creator: address,
        title: vector<u8>,
        description: vector<u8>,
        goal_milestone: u64,
        yes_votes: u64,
        no_votes: u64,
        start_time: u64,
        end_time: u64,
        quorum: u64,
        executed: bool,
    }

    public struct Governance has key, store {
        id: UID,
        proposals: Table<u64, Proposal>,
        next_proposal_id: u64,
    }

    public struct MilestoneVotedEvent has copy, drop, store {
        campaign_id: ID,
        milestone_id: u64,
        voter: address,
        choice: bool,
    }
    
    public fun init_governance(ctx: &mut TxContext) {
        let governance = Governance {
            id: object::new(ctx),
            proposals: table::new(ctx),
            next_proposal_id: 0,
        };

        transfer::public_share_object(governance);
    }

    public entry fun create_proposal(
        governance: &mut Governance,
        campaign: &Campaign,
        milestone_id: u64,
        title: String,
        description: String,
        goal_milestone: u64,
        duration: u64,
        quorum: u64,
        creator: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let proposal_id = governance.next_proposal_id;
        governance.next_proposal_id = governance.next_proposal_id + 1;

        assert!(!is_milestone_voted(campaign, milestone_id), 0);

        let proposal = Proposal {
            id: object::new(ctx),
            proposal_id,
            campaign_id: object::id(campaign),
            milestone_id,
            creator,
            title: *title.as_bytes(),
            description: *description.as_bytes(),
            goal_milestone,
            yes_votes: 0,
            no_votes: 0,
            start_time: clock::timestamp_ms(clock),
            end_time: clock::timestamp_ms(clock) + duration * 1000,
            quorum,
            executed: false,
        };

        table::add(&mut governance.proposals, proposal_id, proposal);
    }
    
    public entry fun vote(
        governance: &mut Governance,
        proposal_id: u64,
        approve: bool,
        campaign: &mut Campaign,
        voter: &FundXContributionNFT,
        store: &ContributionStore,
        clock: &Clock,
        ctx: &mut TxContext,
    ) { 
        let proposal = table::borrow_mut(&mut governance.proposals, proposal_id);
        assert!(clock::timestamp_ms(clock) < proposal.end_time, 0);
        assert!(clock::timestamp_ms(clock) > fundx::get_deadline(campaign), 0);
        assert!(!fundx::is_milestone_released(campaign, proposal.milestone_id), 0);

        let nft_contributor = voter.contributor();
        let campaign_id = fundx::get_campaign_id(campaign);
        assert!(nft_contributor == ctx.sender() && contains_key(store, campaign_id, ctx.sender()), 0);
        let contribution_amount = get_contribution_amount(store, campaign_id, ctx.sender());

        // Check voted or not
        let votes = if (fundx::has_milestone_votes(campaign, proposal.milestone_id)) {
            fundx::get_milestone_votes_mut(campaign, proposal.milestone_id)
        } else {
            let new_map = vec_map::empty<address, bool>();
            fundx::insert_milestone_votes(campaign, proposal.milestone_id, new_map);
            fundx::get_milestone_votes_mut(campaign, proposal.milestone_id)
        };

        let already_voted = vec_map::contains(votes, &ctx.sender());
        assert!(!already_voted, 0);

        vec_map::insert(votes, ctx.sender(), approve);

        // Vote weight
        let total_weight: &mut u64 = if (fundx::has_milestone_vote_weights(campaign, proposal.milestone_id)) {
            fundx::get_milestone_vote_weights_mut(campaign, proposal.milestone_id)
        } else {
            fundx::insert_milestone_vote_weights(campaign, proposal.milestone_id, 0);
            fundx::get_milestone_vote_weights_mut(campaign, proposal.milestone_id)
        };
        *total_weight = *total_weight + contribution_amount;

        if (approve) {
            proposal.yes_votes = proposal.yes_votes + contribution_amount;
        } else {
            proposal.no_votes = proposal.no_votes + contribution_amount;
        };

        event::emit(MilestoneVotedEvent {
            campaign_id: object::id(campaign),
            milestone_id: proposal.milestone_id,
            voter: ctx.sender(),
            choice: approve,
        });
    }
}
