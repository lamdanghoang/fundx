import { Button } from "@/components/ui/button";
import VotingCampaignCard from "./VotingCampaignCard";
import Link from "next/link";
import { VotingCampaign } from "@/lib/interface";

interface VotingCampaignProps {
  votingCampaigns: VotingCampaign[];
}

const VotingCampaignSection = ({ votingCampaigns }: VotingCampaignProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaigns Needing Your Vote</h2>
        <Link href="/discover?voting=true">
          <Button variant="link">View all</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {votingCampaigns.map((campaign, index) => {
          return (
            <VotingCampaignCard
              key={index}
              campaign={campaign}
              milestone={campaign.milestone}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VotingCampaignSection;
