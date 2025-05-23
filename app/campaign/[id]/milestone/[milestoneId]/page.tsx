"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Campaign, Milestone } from "@/lib/interface";
import {
  getCampaignById,
  getMilestonesCampaignById,
  updateVotes,
} from "@/lib/api";
import { useVoteMilestone } from "@/hooks/useFundXContract";
import { formatDigest } from "@mysten/sui/utils";
import { useCurrentAccount } from "@mysten/dapp-kit";

const MilestoneVoting = () => {
  const { id, milestoneId } = useParams<{
    id: string;
    milestoneId: string;
  }>();
  const [campaign, setCampaign] = useState<Campaign>();
  const [milestone, setMilestone] = useState<Milestone>();
  const [vote, setVote] = useState<"approve" | "reject" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const { sign_to_vote, digest, isLoading: load, error } = useVoteMilestone();
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const fetchCampaign = async () => {
      setIsLoading(true);
      const campaignData = await getCampaignById(id);
      console.log(campaignData);
      setCampaign(campaignData.data);

      const milestonesData = await getMilestonesCampaignById(id);
      const milestones: Milestone[] = milestonesData.data.milestones;
      const filter = milestones.find(
        (milestone) => milestone.milestone_id === +milestoneId
      );
      if (filter) setMilestone(filter);

      setIsLoading(false);
    };
    fetchCampaign();
  }, [id, milestoneId]);

  // Effect to observe the digest value from the hook and update UI accordingly for voting
  useEffect(() => {
    if (digest && campaign && currentAccount) {
      toast("Voting is successful", {
        description: `Txn: ${formatDigest(digest)}`,
        action: {
          label: "View",
          onClick: () =>
            window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
        },
        style: {
          backgroundColor: "#0986f5",
        },
      });

      if (vote === "approve") {
        const weight =
          findAmountByWalletAddress(
            campaign.contributions,
            currentAccount.address
          ) || 0;

        const total_weight = campaign.current_amount;
        const voteResult = (weight / total_weight) * 100;
        updateVotes(id, milestoneId, { voteResult });
      }

      setIsVoted(true);
    }
  }, [digest]);

  // Effect to observe errors from the hook for voting
  useEffect(() => {
    if (error) {
      toast("Voting Error", {
        description: `${error}`,
        action: {
          label: "Retry",
          onClick: () =>
            sign_to_vote(id, +milestoneId, vote === "approve" ? true : false),
        },
      });
    }
  }, [error, id, milestoneId, vote]);

  const isContributor = () => {
    if (!currentAccount?.address) {
      return false;
    }
    if (campaign) {
      return campaign?.contributions.some(
        (contributor) => contributor.wallet_address === currentAccount.address
      );
    } else {
      return false;
    }
  };

  const handleSubmitVote = () => {
    if (!vote) {
      toast.error("Please select your vote before submitting");
      return;
    }

    sign_to_vote(id, +milestoneId, vote === "approve" ? true : false);
  };

  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Loading...</h1>
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </div>
    );
  } else {
    if (!campaign || !milestone) {
      return (
        <div className="container py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Resource Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The milestone you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/discover">Browse Campaigns</Link>
          </Button>
        </div>
      );
    }
    return (
      <div className="container py-8 px-4 md:px-0">
        <div className="mb-6">
          <Link
            href={`/campaign/${id}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">{campaign.campaign_name}</h1>
            <p className="text-muted-foreground mt-2">
              Milestone Voting: {milestone.title}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <Image
                  src={`https://aggregator.testnet.walrus.atalma.io/v1/blobs/${campaign.images[0].img_id}`}
                  alt={campaign.campaign_name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
                Image here
              </div>

              <Card>
                <CardContent>
                  <h3 className="font-bold mb-3">Milestone Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Release Amount:
                      </span>
                      <span className="font-medium">
                        {milestone.goal_milestone.toLocaleString()} SUI
                      </span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="font-medium">
                        {formatDate(milestone.timeline_start)} -{" "}
                        {formatDate(milestone.timeline_end)}
                      </span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Voting Deadline:
                      </span>
                      <span className="font-medium">
                        {formatDate(milestone.voting_end || "")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current Approval:
                      </span>
                      <span className="font-medium">
                        {milestone.vote_result}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2">
                  Milestone Description
                </h3>
                <p className="text-muted-foreground">{milestone.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Deliverables</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {milestone.deliverables.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {isVoted ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-2" />
                    <h3 className="text-xl font-bold mb-2">Vote Submitted</h3>
                    <p className="text-muted-foreground mb-4">
                      Thank you for participating in this milestone vote. Your
                      input helps ensure the project meets the community&apos;s
                      expectations.
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Results will be finalized after the voting deadline on{" "}
                      {formatDate(milestone.voting_end || "")}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-bold mb-4">Cast Your Vote</h3>

                    <div className="space-y-4">
                      <RadioGroup
                        value={vote || ""}
                        onValueChange={(v) =>
                          setVote(v as "approve" | "reject")
                        }
                      >
                        <div className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:border-green-400">
                          <RadioGroupItem
                            value="approve"
                            id="approve"
                            className="mt-1"
                          />
                          <div>
                            <Label
                              htmlFor="approve"
                              className="text-base font-medium text-green-700"
                            >
                              Approve Release of Funds
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              The milestone deliverables have been met
                              satisfactorily and funds should be released.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:border-red-400">
                          <RadioGroupItem
                            value="reject"
                            id="reject"
                            className="mt-1"
                          />
                          <div>
                            <Label
                              htmlFor="reject"
                              className="text-base font-medium text-red-700"
                            >
                              Reject & Request Improvements
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              The deliverables don&apos;t meet expectations and
                              improvements should be made before funds are
                              released.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>

                      {/* <div>
                      <Label htmlFor="comment" className="mb-2 block">
                        Additional Comments (Optional)
                      </Label>
                      <Textarea
                        id="comment"
                        placeholder="Share your thoughts on this milestone..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                      />
                    </div> */}

                      <Button
                        onClick={handleSubmitVote}
                        disabled={!vote || load || !isContributor()}
                        className="w-full"
                      >
                        {load && "Submitting..."}
                        {!isContributor() &&
                          currentAccount?.address &&
                          "Only contributors can vote"}
                        {!currentAccount?.address && "Connect your wallet"}
                        {!load && isContributor() && "Submit Vote"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h3 className="font-bold mb-3">Voting Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Approval Rating</span>
                    <span className="text-sm font-medium">
                      {milestone.vote_result}%
                    </span>
                  </div>
                  <Progress value={milestone.vote_result} className="h-3" />
                </div>

                <div className="flex flex-wrap gap-4 justify-center text-center">
                  <div className="bg-muted p-4 rounded-lg min-w-[100px]">
                    <div className="text-2xl font-bold text-green-600">
                      {milestone.vote_result}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Approval Rate
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg min-w-[100px]">
                    <div className="text-2xl font-bold text-amber-600">
                      {differenceInDays(milestone.voting_end, Date.now())}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Days Left
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button asChild variant="outline">
              <Link href={`/campaign/${id}`}>Return to Campaign</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
};

export default MilestoneVoting;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "MMMM d, yyyy");
};

const findAmountByWalletAddress = (
  data: {
    amount: number;
    tier_type: string;
    tx_hash: string;
    wallet_address: string;
  }[],
  targetWalletAddress: string
): number | undefined => {
  const foundItem = data.find(
    (item) => item.wallet_address === targetWalletAddress
  );
  return foundItem?.amount;
};
