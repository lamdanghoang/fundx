import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignList from "./CampaignList";
import { CampaignProps } from "./CampaignCard";

interface CampaignHighlightsProps {
  trendingCampaigns: CampaignProps[];
  newCampaigns: CampaignProps[];
  endingSoonCampaigns: CampaignProps[];
}

const CampaignHighlights = ({
  trendingCampaigns,
  newCampaigns,
  endingSoonCampaigns,
}: CampaignHighlightsProps) => {
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
        <CampaignList campaigns={trendingCampaigns} />
      </TabsContent>

      <TabsContent value="new" className="mt-0">
        <CampaignList campaigns={newCampaigns} />
      </TabsContent>

      <TabsContent value="ending-soon" className="mt-0">
        <CampaignList campaigns={endingSoonCampaigns} />
      </TabsContent>
    </Tabs>
  );
};

export default CampaignHighlights;
