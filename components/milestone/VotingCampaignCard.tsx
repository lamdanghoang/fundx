import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Vote, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { VotingCampaign, Milestone } from "@/lib/interface";

interface VotingCampaignCardProps {
  campaign: VotingCampaign;
  milestone: Milestone;
}

const VotingCampaignCard = ({
  campaign,
  milestone,
}: VotingCampaignCardProps) => {
  // Calculate days left for voting
  const votingEndDate = new Date(milestone.voting_end || "");
  const today = new Date();
  const daysLeft = Math.ceil(
    (votingEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="pt-0 overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video relative overflow-hidden">
        <Image
          src={`https://aggregator.testnet.walrus.atalma.io/v1/blobs/${campaign.images[0].img_id}`}
          alt={campaign.campaign_name}
          width={500}
          height={500}
          className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
        />
        <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
          Voting Active
        </div>
      </div>

      <CardContent className="p-4">
        <Link
          href={`/campaign/${campaign.object_id}`}
          className="hover:underline"
        >
          <h3 className="font-bold text-lg line-clamp-1">
            {campaign.campaign_name}
          </h3>
        </Link>

        <div className="mt-2 mb-1">
          <h4 className="font-medium text-sm">Milestone: {milestone.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {milestone.description}
          </p>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Approval Vote</span>
            <span>{milestone.vote_result}%</span>
          </div>
          <Progress value={milestone.vote_result} className="h-2" />

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center text-xs">
              <Clock className="h-3 w-3 mr-1" />
              <span>{daysLeft} days left to vote</span>
            </div>
            <div className="text-xs">
              {milestone.goal_milestone.toLocaleString()} SUI
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link
          href={`/campaign/${campaign.object_id}/milestone/${milestone.milestone_id}`}
          className="w-full"
        >
          <Button variant="secondary" size="sm" className="w-full">
            <Vote className="mr-1 h-4 w-4" />
            Vote Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default VotingCampaignCard;
