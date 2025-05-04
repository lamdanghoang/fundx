"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, Vote } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Milestone } from "@/lib/interface";
import { useClaimMilestoneFund } from "@/hooks/useFundXContract";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDigest } from "@mysten/sui/utils";
import { updateClaimed } from "@/lib/api";

interface MilestoneListProps {
  milestones: Milestone[];
  campaignId: string;
}

const MilestoneList = ({ milestones, campaignId }: MilestoneListProps) => {
  const [milestoneId, setMilestoneId] = useState("");
  const {
    sign_to_claim,
    digest: claimDigest,
    isLoading: claimLoad,
    error: claimErr,
  } = useClaimMilestoneFund();

  // Effect to observe the digest value from the hook and update UI accordingly for claiming
  useEffect(() => {
    if (claimDigest) {
      toast("Claiming is successful", {
        description: `Txn: ${formatDigest(claimDigest)}`,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `https://suiscan.xyz/testnet/tx/${claimDigest}`,
              "_blank"
            ),
        },
        style: {
          backgroundColor: "#0986f5",
        },
      });

      updateClaimed(campaignId, milestoneId);
    }
  }, [claimDigest]);

  // Effect to observe errors from the hook for claiming
  useEffect(() => {
    if (claimErr) {
      toast("Voting Error", {
        description: `${claimErr}`,
        action: {
          label: "Retry",
          onClick: () => sign_to_claim(campaignId, +milestoneId),
        },
      });
    }
  }, [claimErr, campaignId, milestoneId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  const getStatusBadge = (status: Milestone["status"]) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Upcoming
          </Badge>
        );
      case "in-voting":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            Voting Open
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Project Milestones</h3>
      <div className="space-y-4">
        {milestones.length > 0 ? (
          milestones.map((milestone, index) => (
            <div key={index} className="border rounded-lg p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold">
                  Milestone {index + 1}: {milestone.title}
                </h4>
                {getStatusBadge(milestone.status)}
              </div>

              <p className="text-muted-foreground mb-3">
                {milestone.description}
              </p>

              <div className="flex flex-wrap gap-3 mb-3">
                <div className="bg-muted px-3 py-1 rounded-full text-xs flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(milestone.timeline_start)} -{" "}
                  {formatDate(milestone.timeline_end)}
                </div>
                <div className="bg-muted px-3 py-1 rounded-full text-xs">
                  {milestone.goal_milestone.toLocaleString()} SUI
                </div>
              </div>

              {milestone.deliverables && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium mb-1">Deliverables:</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {milestone.deliverables.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {milestone.status === "in-voting" && (
                <>
                  <div className="mt-3 mb-1">
                    <div className="flex justify-between text-sm">
                      <span>Approval Vote</span>
                      <span>{milestone.vote_result}%</span>
                    </div>
                    <Progress value={milestone.vote_result} className="h-2" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        Voting ends {formatDate(milestone.voting_end || "")}
                      </span>
                      <Link
                        href={`/campaign/${campaignId}/milestone/${milestone.milestone_id}`}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex items-center"
                        >
                          <Vote className="mr-1 h-4 w-4" />
                          Vote Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {milestone.status === "completed" && milestone.is_claimed && (
                <div className="flex items-center text-green-600 mt-3">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Completed and funds released</span>
                </div>
              )}

              {milestone.status === "approved" && !milestone.is_claimed && (
                <>
                  <div className="mt-3 mb-1">
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        Voting ends {formatDate(milestone.voting_end || "")}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={claimLoad}
                        onClick={() => {
                          setMilestoneId(`${milestone.milestone_id}`);
                          sign_to_claim(
                            milestone.object_id,
                            milestone.milestone_id
                          );
                        }}
                        className="flex items-center bg-fund-400 hover:bg-fund-500"
                      >
                        <Vote className="mr-1 h-4 w-4" />
                        {claimLoad ? "Claiming..." : "Claim Now"}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {milestone.status === "upcoming" && (
                <div className="flex items-center text-muted-foreground mt-3">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    Waiting for previous milestones to complete
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <>No milestones</>
        )}
      </div>
    </div>
  );
};

export default MilestoneList;
