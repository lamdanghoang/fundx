import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Contribution } from "@/app/profile/page";
import { formatAddress } from "@mysten/sui/utils";
import Image from "next/image";

interface UserBackedCampaignsProps {
  campaigns: Contribution[];
}

const UserBackedCampaigns = ({ campaigns }: UserBackedCampaignsProps) => {
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
                  src={`https://aggregator.testnet.walrus.atalma.io/v1/blobs/${campaign.images.img_id}`}
                  alt={campaign.campaign_details.campaign_name}
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
                        href={`/campaign/${campaign.campaign_details.object_id}`}
                        className="hover:underline"
                      >
                        <h3 className="font-bold text-lg">
                          {campaign.campaign_details.campaign_name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {campaign.campaign_details.description}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {campaign.campaign_details.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Your contribution:
                      </span>
                      <span className="font-medium">
                        {campaign.total_contributed_by_user} SUI
                      </span>
                    </div>
                    {/* <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {format(
                        new Date(campaign.contributionDate),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div> */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Campaign progress:
                      </span>
                      <span className="font-medium">
                        {Math.round(
                          (campaign.campaign_details.current_amount /
                            campaign.campaign_details.goal) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between mt-auto">
                  <div className="text-xs text-muted-foreground">
                    by{" "}
                    <span className="font-medium">
                      {campaign.campaign_details.creator ||
                        formatAddress(
                          campaign.campaign_details.creator_address
                        )}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Link
                      href={`/campaign/${campaign.campaign_details.object_id}`}
                    >
                      <Button variant="outline" size="sm">
                        View Details
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

export default UserBackedCampaigns;
