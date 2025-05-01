import { Button } from "@/components/ui/button";
import VotingCampaignCard from "./VotingCampaignCard";
import Link from "next/link";
import { VotingCampaign } from "@/lib/interface";
import { useEffect, useState } from "react";
import { getVotingCampains } from "@/lib/api";
import { Loader2 } from "lucide-react";

const VotingCampaignSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [votingCampaigns, setVotingCampaigns] = useState<VotingCampaign[]>([]);

  useEffect(() => {
    const fetchCampaignList = async () => {
      setIsLoading(true);

      const votingCampaigns = await getVotingCampains(10, 0);
      setVotingCampaigns(votingCampaigns.data);
      setIsLoading(false);
    };
    fetchCampaignList();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaigns Needing Your Vote</h2>
        <Link href="/discover?voting=true">
          <Button variant="link">View all</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 flex flex-col items-center justify-center gap-2">
            <span className="text-fund-800">Loading...</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        ) : (
          votingCampaigns.map((campaign, index) => {
            return (
              <VotingCampaignCard
                key={index}
                campaign={campaign}
                milestone={campaign.milestone}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default VotingCampaignSection;
