"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignList from "./CampaignList";
import { Campaign } from "@/lib/interface";
import { getCampaigns } from "@/lib/api";
import { Loader2 } from "lucide-react";

const CampaignHighlights = () => {
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCampaignList = async () => {
      setIsLoading(true);
      const result = await getCampaigns(10, 0);
      setActiveCampaigns(result.data);
      setIsLoading(false);
    };
    fetchCampaignList();
  }, []);

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
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-fund-800">Loading...</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        ) : (
          <CampaignList campaigns={activeCampaigns} />
        )}
      </TabsContent>

      <TabsContent value="new" className="mt-0">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-fund-800">Loading...</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        ) : (
          <CampaignList campaigns={activeCampaigns} />
        )}
      </TabsContent>

      <TabsContent value="ending-soon" className="mt-0">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-fund-800">Loading...</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        ) : (
          <CampaignList campaigns={activeCampaigns} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CampaignHighlights;
