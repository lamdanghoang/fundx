import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatAddress } from "@mysten/sui/utils";
import Image from "next/image";
import { Campaign } from "@/lib/interface";
import { format } from "date-fns";

interface UserCampaignsProps {
  campaigns: Campaign[];
}

const UserCampaigns = ({ campaigns }: UserCampaignsProps) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          You haven&apos;t backed any campaigns yet.
        </p>
        <Link href="/discover">
          <Button>Discover Campaigns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 w-full">
        {campaigns.map((campaign, index) => (
          <Card key={index} className="md:w-[1024px]">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 h-48 md:h-auto">
                <Image
                  src={`https://aggregator.testnet.walrus.atalma.io/v1/blobs/${campaign.images[0].img_id}`}
                  alt={campaign.campaign_name}
                  width={500}
                  height={300}
                  className="px-2 w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="md:w-3/4 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/campaign/${campaign.object_id}`}
                        className="hover:underline"
                      >
                        <h3 className="font-bold text-lg">
                          {campaign.campaign_name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {campaign.description}
                      </p>
                    </div>
                    <Badge variant="secondary">{campaign.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Your contribution:
                      </span>
                      <span className="font-medium">
                        {campaign.current_amount} SUI
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Campaign progress:
                      </span>
                      <span className="font-medium">
                        {Math.round(
                          (campaign.current_amount / campaign.goal) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">End at:</span>
                      <span className="font-medium">
                        {format(new Date(campaign.end_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between mt-auto">
                  <div className="text-xs text-muted-foreground">
                    by{" "}
                    <span className="font-medium">
                      {campaign.creator ||
                        formatAddress(campaign.creator_address)}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Link href={`/create-proposal`}>
                      <Button variant="outline" size="sm">
                        Create a Proposal
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserCampaigns;
