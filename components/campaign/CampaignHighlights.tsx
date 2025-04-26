import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignList from "./CampaignList";
import { CampaignProps } from "./CampaignCard";
import { Campaign } from "@/lib/interface";

interface CampaignHighlightsProps {
  trendingCampaigns: CampaignProps[];
  newCampaigns: Campaign[];
  endingSoonCampaigns: CampaignProps[];
}

const CampaignHighlights = ({ newCampaigns }: CampaignHighlightsProps) => {
  return (
    <Tabs defaultValue="trending" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Discover Campaigns</h2>
        <TabsList>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="ending-soon">Ending Soon</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="trending" className="mt-0">
        <CampaignList campaigns={newCampaigns} />
      </TabsContent>

      <TabsContent value="new" className="mt-0">
        <CampaignList campaigns={newCampaigns} />
      </TabsContent>

      <TabsContent value="ending-soon" className="mt-0">
        <CampaignList campaigns={newCampaigns} />
      </TabsContent>
    </Tabs>
  );
};

export default CampaignHighlights;
