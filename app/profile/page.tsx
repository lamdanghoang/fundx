"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserBackedCampaigns from "@/components/profile/UserBackedCampaigns";
import UserNFTCollection from "@/components/profile/UserNFTCollection";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getContributionByAddress } from "@/lib/api";
import { formatAddress } from "@mysten/sui/utils";
import { Loader2, Wallet } from "lucide-react";
import { CustomBtn } from "@/components/wallet/ConnectButton";
import { NftFieldProps, useGetNft } from "@/hooks/useFundXContract";

interface CampaignDetails {
  blob_id: string;
  campaign_name: string;
  category: string;
  creator: string;
  creator_address: string;
  currency: string;
  current_amount: number;
  description: string;
  goal: number;
  object_id: string;
  reward_type: string;
}

export interface Contribution {
  campaign_details: CampaignDetails;
  campaign_id: string;
  images: {
    img_id: string;
    type: string;
  };
  total_contributed_by_user: number;
}

// Mock user data - in a real app, this would come from authentication
// const user = {
//   id: "user-1",
//   name: "Alex Johnson",
//   address: "0x1a2b...3c4d",
//   avatarUrl: "https://i.pravatar.cc/150?img=12",
//   joinedDate: "January 2023",
//   totalBacked: 12,
//   totalContributed: 2450, // SUI
// };

// Mock user backed campaigns - in a real app, this would come from API/blockchain
// const userBackedCampaigns = mockCampaigns.slice(0, 3).map((campaign) => ({
//   ...campaign,
//   contributionAmount: Math.floor(Math.random() * 200) + 50,
//   contributionDate: new Date(
//     Date.now() - Math.floor(Math.random() * 30) * 86400000
//   ).toISOString(),
// }));

// Mock NFT collection - in a real app, this would come from API/blockchain
// const userNFTs = [
//   {
//     id: "nft-1",
//     name: "Early Supporter Badge",
//     imageUrl: "https://i.pravatar.cc/300?img=1",
//     campaign: mockCampaigns[0].title,
//     campaignId: mockCampaigns[0].id,
//     rarity: "Rare",
//     acquiredDate: "2023-06-15",
//     currentPrice: null, // Not listed for sale
//     isStaked: false,
//   },
//   {
//     id: "nft-2",
//     name: "Gold Tier Backer",
//     imageUrl: "https://i.pravatar.cc/300?img=2",
//     campaign: mockCampaigns[1].title,
//     campaignId: mockCampaigns[1].id,
//     rarity: "Epic",
//     acquiredDate: "2023-08-22",
//     currentPrice: 350, // Listed for sale at 350 SUI
//     isStaked: false,
//   },
//   {
//     id: "nft-3",
//     name: "Diamond Supporter",
//     imageUrl: "https://i.pravatar.cc/300?img=3",
//     campaign: mockCampaigns[2].title,
//     campaignId: mockCampaigns[2].id,
//     rarity: "Legendary",
//     acquiredDate: "2023-09-05",
//     currentPrice: null, // Not listed
//     isStaked: true,
//   },
//   {
//     id: "nft-4",
//     name: "Community Pioneer",
//     imageUrl: "https://i.pravatar.cc/300?img=4",
//     campaign: mockCampaigns[0].title,
//     campaignId: mockCampaigns[0].id,
//     rarity: "Uncommon",
//     acquiredDate: "2023-10-15",
//     currentPrice: 120, // Listed for sale at 120 SUI
//     isStaked: false,
//   },
// ];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("backed");
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [nfts, setNfts] = useState<NftFieldProps[]>([]);
  const [totalContributed, setTotalContributed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const currentAccount = useCurrentAccount();
  const { get_all_nfts } = useGetNft();

  useEffect(() => {
    if (!currentAccount) return;

    const fetchContribution = async () => {
      setIsLoading(true);
      const contributionData = await getContributionByAddress(
        currentAccount.address
      );

      setContributions(contributionData.data);
      setTotalContributed(contributionData.total_contributed);

      const userNfts = await get_all_nfts(currentAccount.address);
      setNfts(userNfts);

      setIsLoading(false);
    };

    fetchContribution();
  }, [currentAccount]);

  // Wallet connection screen when no wallet is connected
  if (!currentAccount) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="pt-10 pb-10 px-8 flex flex-col items-center gap-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
                <p className="text-muted-foreground">
                  Please connect your wallet to view your profile, backed
                  campaigns, and NFT collection.
                </p>
              </div>
              <CustomBtn />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Loading your profile...</h1>
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[2000px] mx-auto">
          {/* User Profile Header */}
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src="https://avatar.iran.liara.run/public"
                    alt="avatar"
                  />
                  <AvatarFallback>{"AV".substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {formatAddress(currentAccount.address || "")}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {currentAccount.address}
                      </p>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">
                    Joined {user.joinedDate}
                  </p> */}
                  </div>
                  <div className="flex gap-10 pt-2">
                    <div>
                      <p className="text-xl font-bold">
                        {contributions?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Campaigns Backed
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {totalContributed || 0} SUI
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Contributed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for backed campaigns and NFT collection */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="backed">Backed Campaigns</TabsTrigger>
              <TabsTrigger value="nfts">NFT Collection</TabsTrigger>
            </TabsList>

            <TabsContent value="backed" className="space-y-4">
              <h2 className="text-2xl font-bold">Your Backed Campaigns</h2>
              <UserBackedCampaigns campaigns={contributions} />
            </TabsContent>

            <TabsContent value="nfts" className="space-y-4">
              <h2 className="text-2xl font-bold">Your NFT Collection</h2>
              <UserNFTCollection nfts={nfts} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }
};

export default Profile;
