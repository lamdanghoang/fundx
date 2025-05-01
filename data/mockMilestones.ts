export interface Milestone {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  fundAmount: number;
  status: "upcoming" | "in-voting" | "approved" | "rejected" | "completed";
  startDate: string;
  endDate: string;
  votingEndDate?: string;
  approvalPercentage?: number;
  deliverables: string[];
}

export const mockMilestones: Milestone[] = [
  {
    id: "milestone-1-crypto-garden",
    campaignId:
      "0x36a62214bb312faf5e73c3e4219cf83a7629f53de147f56198b6e57a0e2d4180",
    title: "Research & Design Phase",
    description:
      "Complete market research and finalize sustainable farm design specifications.",
    fundAmount: 50000,
    status: "completed",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    approvalPercentage: 92,
    deliverables: [
      "Market research report",
      "Technical specifications document",
      "Sustainability assessment",
    ],
  },
  {
    id: "milestone-2-crypto-garden",
    campaignId:
      "0x36a62214bb312faf5e73c3e4219cf83a7629f53de147f56198b6e57a0e2d4180",
    title: "Initial Implementation",
    description:
      "Begin construction and implementation of core farming infrastructure.",
    fundAmount: 100000,
    status: "in-voting",
    startDate: "2025-03-16",
    endDate: "2025-06-15",
    votingEndDate: "2025-05-15",
    approvalPercentage: 68,
    deliverables: [
      "Infrastructure construction",
      "Initial seed planting",
      "Installation of monitoring systems",
    ],
  },
  {
    id: "milestone-3-crypto-garden",
    campaignId:
      "0x36a62214bb312faf5e73c3e4219cf83a7629f53de147f56198b6e57a0e2d4180",
    title: "Final Deployment & Launch",
    description: "Complete implementation and launch full operations.",
    fundAmount: 100000,
    status: "upcoming",
    startDate: "2025-06-16",
    endDate: "2025-09-15",
    deliverables: [
      "Complete operational system",
      "Training and documentation",
      "Public launch event",
    ],
  },
  {
    id: "milestone-1-nft-art-gallery",
    campaignId:
      "0xe1aeaa5b06ed59ce6aa95ce939ebb6f73ebaaedf6fc4bfec75dba151a0cfe234",
    title: "Platform Development",
    description: "Develop the core NFT gallery platform and user interface.",
    fundAmount: 40000,
    status: "in-voting",
    startDate: "2025-02-01",
    endDate: "2025-04-30",
    votingEndDate: "2025-05-10",
    approvalPercentage: 75,
    deliverables: [
      "Working beta version",
      "Artist onboarding system",
      "NFT minting functionality",
    ],
  },
  {
    id: "milestone-2-nft-art-gallery",
    campaignId:
      "0xe1aeaa5b06ed59ce6aa95ce939ebb6f73ebaaedf6fc4bfec75dba151a0cfe234",
    title: "Marketplace Integration",
    description: "Add marketplace functionality and payment processing.",
    fundAmount: 50000,
    status: "upcoming",
    startDate: "2025-05-01",
    endDate: "2025-07-31",
    deliverables: [
      "Secure payment system",
      "Bidding functionality",
      "Artist dashboard",
    ],
  },
  {
    id: "milestone-1-defi-education",
    campaignId:
      "0xb9ccb3ec2acb0629fbb5a0dc32e4d8c3b3ccc6e444901960640564e2d9376977",
    title: "Content Creation",
    description:
      "Develop comprehensive educational content on DeFi fundamentals.",
    fundAmount: 30000,
    status: "in-voting",
    startDate: "2025-03-01",
    endDate: "2025-05-31",
    votingEndDate: "2025-05-20",
    approvalPercentage: 82,
    deliverables: [
      "10 comprehensive learning modules",
      "Interactive tutorials",
      "Knowledge assessment tools",
    ],
  },
];

// Get milestones in voting period
export const getMilestonesInVoting = () => {
  return mockMilestones.filter((milestone) => milestone.status === "in-voting");
};

// Get campaign milestones
export const getCampaignMilestones = (campaignId: string) => {
  return mockMilestones.filter(
    (milestone) => milestone.campaignId === campaignId
  );
};

// Get milestone by ID
export const getMilestoneById = (milestoneId: string) => {
  return mockMilestones.find((milestone) => milestone.id === milestoneId);
};

// Get campaigns with milestones in voting
export const getCampaignsWithMilestonesInVoting = (campaigns: any[]) => {
  const campaignIds = new Set(
    mockMilestones
      .filter((milestone) => milestone.status === "in-voting")
      .map((milestone) => milestone.campaignId)
  );

  return campaigns.filter((campaign) => campaignIds.has(campaign.id));
};
