"use client";
import { useEffect, useState } from "react";
import CampaignList from "@/components/campaign/CampaignList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, SlidersHorizontal, X, Vote } from "lucide-react";
import { getCampaigns, getVotingCampains } from "@/lib/api";
import { Campaign, VotingCampaign } from "@/lib/interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VotingCampaignSection from "@/components/milestone/VotingCampaignSection";

const categories = [
  "All Categories",
  "Technology",
  "Art",
  "Music",
  "Film",
  "Games",
  "Publishing",
  "Charity",
  "Education",
  "Sustainability",
];

const Discover = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [fundingRange, setFundingRange] = useState([0, 500000]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [isAlmostFunded, setIsAlmostFunded] = useState(false);
  const [isEndingSoon, setIsEndingSoon] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [votingCampaigns, setVotingCampaigns] = useState<VotingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setFundingRange([0, 500000]);
    setIsAlmostFunded(false);
    setIsEndingSoon(false);
  };

  useEffect(() => {
    const fetchCampaignList = async () => {
      setIsLoading(true);
      const campaigns = await getCampaigns(10, 0);
      setCampaigns(campaigns.data);

      const votingCampaigns = await getVotingCampains(10, 0);
      setVotingCampaigns(votingCampaigns.data);
      setIsLoading(false);
    };
    fetchCampaignList();
  }, []);

  return (
    <div className="container py-8 px-4 md:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Discover Campaigns</h1>
        <Button
          onClick={toggleFilters}
          variant="outline"
          className="flex items-center"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="voting" className="flex items-center">
            <Vote className="h-4 w-4 mr-1" />
            Needs Voting ({votingCampaigns.length})
          </TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtersVisible && (
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Advanced Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-8"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Funding Goal Range
                  </h4>
                  <div className="px-2">
                    <Slider
                      defaultValue={fundingRange}
                      max={500000}
                      step={10000}
                      onValueChange={setFundingRange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{fundingRange[0].toLocaleString()} SUI</span>
                      <span>{fundingRange[1].toLocaleString()} SUI</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Campaign Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="almost-funded"
                        checked={isAlmostFunded}
                        onCheckedChange={(checked) =>
                          setIsAlmostFunded(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="almost-funded"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Almost Funded ({">"}80%)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ending-soon"
                        checked={isEndingSoon}
                        onCheckedChange={(checked) =>
                          setIsEndingSoon(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="ending-soon"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Ending Soon ({"<"}7 days)
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Sort By</h4>
                  <Select defaultValue="popularity">
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="ending-soon">Ending Soon</SelectItem>
                      <SelectItem value="most-funded">Most Funded</SelectItem>
                      <SelectItem value="least-funded">Least Funded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-fund-800">Loading...</span>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          ) : campaigns.length > 0 ? (
            <>
              <CampaignList campaigns={campaigns} />
              <div className="mt-8 text-center">
                <Button variant="outline">Load More</Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="voting" className="mt-0">
          {votingCampaigns.length > 0 ? (
            <VotingCampaignSection votingCampaigns={votingCampaigns} />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">
                No campaigns currently in voting period
              </h3>
              <p className="text-muted-foreground mb-4">
                Check back later for campaigns needing community input
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discover;
