type RewardType = "none" | "token" | "nft";
type State = "done" | "in-progress" | "future";

interface StoryField {
  title: string;
  content: string;
}

interface RoadmapPhase {
  title: string;
  timeline: string;
  description: string;
  state: State;
}

interface TeamProps {
  name: string;
  role: string;
  contact?: {
    email?: string;
    twitter?: string;
    telegram?: string;
  };
}

export interface CampaignFormProps {
  title: string;
  category: string;
  description: string;
  storyFields: StoryField[];
  roadmapPhases: RoadmapPhase[];
  teams: TeamProps[];
  galleryImages: string[];
  targetAmount: number;
  duration: number;
  rewardType: RewardType;
  creatorAddress: string;
  creatorName: string;
  currency: string;
}

export interface Campaign {
  blob_id: string;
  campaign_name: string;
  category: string;
  contributions: Contribution[];
  created_at: string;
  creator: string;
  creator_address: string;
  currency: string;
  current_amount: number;
  description: string;
  end_at: string;
  goal: number;
  images: Image[];
  is_completed: boolean;
  is_pending: boolean;
  object_id: string;
  reward_type: RewardType;
  start_at: string;
  tx_hash: string;
}

interface Contribution {
  wallet_address: string;
  amount: number;
  tier_type: string;
  tx_hash: string;
}

interface Image {
  img_id: string;
  type: string;
}
