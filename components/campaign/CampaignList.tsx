import CampaignCard, { CampaignProps } from "./CampaignCard";

interface CampaignListProps {
  campaigns: CampaignProps[];
}

const CampaignList = ({ campaigns }: CampaignListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} {...campaign} />
      ))}
    </div>
  );
};

export default CampaignList;
