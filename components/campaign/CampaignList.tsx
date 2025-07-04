import { Campaign } from "@/lib/interface";
import CampaignCard from "./CampaignCard";

interface CampaignListProps {
  campaigns: Campaign[];
}

const CampaignList = ({ campaigns }: CampaignListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.blob_id} {...campaign} />
      ))}
    </div>
  );
};

export default CampaignList;
