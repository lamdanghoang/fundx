"use client";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { SuiObjectChange } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";

const MODULE_ADDRESS =
  "0x01fb6418e2bafa9f20fc4e5b700f5010ffee1bc3a26069f6cc77a29cfff6bc3e";
const MODULE_NAME = "fundx";

// Helper function to get the full module ID
const getModuleId = () => `${MODULE_ADDRESS}::${MODULE_NAME}`;

export const useCreateCampaign = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectChanges, setObjectChanges] = useState<SuiObjectChange[]>([]);
  const [createdObjectId, setCreatedObjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const sign_to_create_campaign = async (
    blobId: string,
    goal: number,
    duration: number
  ) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setCreatedObjectId("");
    setDigest("");

    console.log("=== Campaign Creation Started ===");
    console.log("Parameters:", { blobId, goal, duration });
    console.log("Current account:", account?.address);

    try {
      // Format values
      const goalFormatted = toSuiU64(goal);
      const durationFormatted = daysToSeconds(duration);

      console.log("Formatted values:", {
        goalFormatted,
        durationFormatted,
        moduleId: getModuleId(),
      });

      const txb = new Transaction();

      console.log("Creating transaction block...");

      // Build the transaction
      txb.moveCall({
        target: `${getModuleId()}::create_campaign`,
        arguments: [
          txb.pure.string(blobId),
          txb.pure.u64(goalFormatted),
          txb.pure.u64(durationFormatted),
          txb.object.clock(),
        ],
      });

      console.log("Transaction block created, signing and executing...");

      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: txb },
        {
          onSuccess: async (result) => {
            console.log("Initial transaction execution successful");
            console.log("Transaction digest:", result.digest);
            setDigest(result.digest);

            try {
              console.log("Waiting for transaction confirmation...");
              const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showObjectChanges: true,
                },
              });

              console.log("Transaction confirmed");

              // Full response logging for debugging (commented out for production)
              // console.log("Full transaction response:", JSON.stringify(txResponse, null, 2));

              // Check status safely
              const txStatus = txResponse.effects?.status?.status;
              console.log("Transaction status:", txStatus);

              if (txStatus !== "success") {
                const errorMessage =
                  txResponse.effects?.status?.error || "Unknown error";
                console.error("Transaction failed with status:", errorMessage);
                throw new Error(`Transaction failed: ${errorMessage}`);
              }

              // Process object changes
              if (
                Array.isArray(txResponse.objectChanges) &&
                txResponse.objectChanges.length > 0
              ) {
                console.log(
                  `Found ${txResponse.objectChanges.length} object changes`
                );
                setObjectChanges(txResponse.objectChanges);

                // Find created objects
                const createdObjects = txResponse.objectChanges.filter(
                  (change) => change.type === "created"
                );

                if (createdObjects.length > 0) {
                  const newObjectId = createdObjects[0].objectId;
                  console.log("Created object ID:", newObjectId);
                  setCreatedObjectId(newObjectId);

                  // Optional: Get more details about the created object
                  try {
                    const objectInfo = await suiClient.getObject({
                      id: newObjectId,
                      options: { showContent: true },
                    });
                    console.log("Created object details:", objectInfo);
                  } catch (objError) {
                    console.warn("Could not fetch object details");
                  }
                } else {
                  console.log("No objects were created in this transaction");
                }
              } else {
                console.log("No object changes in transaction response");
              }

              console.log("=== Campaign Creation Complete ===");
            } catch (confirmError) {
              console.error("Error confirming transaction:", confirmError);
              setError(new Error(`Transaction confirmation failed`));
            } finally {
              setIsLoading(false);
            }
          },
          onError: (execError) => {
            console.error("Transaction execution failed:", execError);
            setError(
              new Error(`Failed to execute transaction: ${execError.message}`)
            );
            setIsLoading(false);
          },
        }
      );
    } catch (setupError) {
      console.error("Error setting up transaction:", setupError);
      setError(new Error(`Transaction setup failed: `));
      setIsLoading(false);
    }
  };

  return {
    sign_to_create_campaign,
    digest,
    createdObjectId,
    objectChanges,
    isLoading,
    error,
  };
};

export const useCreateContribution = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectChanges, setObjectChanges] = useState<SuiObjectChange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const sign_to_contribute = async (
    campaignId: string,
    title: string,
    image: string,
    metadata: string,
    amount: number
  ) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setDigest("");

    console.log("=== Contribution Transaction Started ===");
    console.log("Parameters:", { campaignId, amount });
    console.log("Current account:", account?.address);

    try {
      // Format values
      const amountFormatted = toSuiU64(amount);
      const storeId =
        process.env.CONTRIBUTION_STORE_ID ||
        "0x5d2e795b589f7307a548199ccc14c54107a0174984c200364a15396ff94e56f2";

      const name = `${title} Contributor`;
      const image_url = `${process.env.NEXT_PUBLIC_AGGREGATOR}/v1/blobs/${image}`;
      const metadata_url = `${process.env.NEXT_PUBLIC_AGGREGATOR}/v1/blobs/${metadata}`;

      console.log("Formatted values:", {
        campaignId,
        name,
        image_url,
        metadata_url,
        amountFormatted,
        storeId,
        moduleId: getModuleId(),
      });

      const txb = new Transaction();

      const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountFormatted)]); // SUI

      console.log("Creating transaction block...");

      // Build the transaction
      txb.moveCall({
        target: `${getModuleId()}::contribute`,
        arguments: [
          txb.object(campaignId),
          txb.pure.string(name),
          txb.pure.string(image_url),
          txb.pure.string(metadata_url),
          coin,
          txb.pure.u64(amountFormatted),
          txb.object.clock(),
          txb.object(storeId),
        ],
      });

      console.log("Transaction block created, signing and executing...");

      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: txb },
        {
          onSuccess: async (result) => {
            console.log("Initial transaction execution successful");
            console.log("Transaction digest:", result.digest);
            setDigest(result.digest);

            try {
              console.log("Waiting for transaction confirmation...");
              const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showObjectChanges: true,
                },
              });

              console.log("Transaction confirmed");

              // Full response logging for debugging (commented out for production)
              // console.log("Full transaction response:", JSON.stringify(txResponse, null, 2));

              // Check status safely
              const txStatus = txResponse.effects?.status?.status;
              console.log("Transaction status:", txStatus);

              if (txStatus !== "success") {
                const errorMessage =
                  txResponse.effects?.status?.error || "Unknown error";
                console.error("Transaction failed with status:", errorMessage);
                throw new Error(`Transaction failed: ${errorMessage}`);
              }

              // Process object changes
              if (
                Array.isArray(txResponse.objectChanges) &&
                txResponse.objectChanges.length > 0
              ) {
                console.log(
                  `Found ${txResponse.objectChanges.length} object changes`
                );
                setObjectChanges(txResponse.objectChanges);
              } else {
                console.log("No object changes in transaction response");
              }

              console.log("=== Contribution Complete ===");
            } catch (confirmError) {
              console.error("Error confirming transaction:", confirmError);
              setError(new Error(`Transaction confirmation failed`));
            } finally {
              setIsLoading(false);
            }
          },
          onError: (execError) => {
            console.error("Transaction execution failed:", execError);
            setError(
              new Error(`Failed to execute transaction: ${execError.message}`)
            );
            setIsLoading(false);
          },
        }
      );
    } catch (setupError) {
      console.error("Error setting up transaction:", setupError);
      setError(new Error(`Transaction setup failed: `));
      setIsLoading(false);
    }
  };

  return {
    sign_to_contribute,
    digest,
    objectChanges,
    isLoading,
    error,
  };
};

export const useCreateProposal = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectChanges, setObjectChanges] = useState<SuiObjectChange[]>([]);
  const [createdObjectId, setCreatedObjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const sign_to_create_proposal = async (
    objectId: string,
    milestoneId: string,
    title: string,
    description: string,
    goal: number,
    duration: number,
    quorum: number,
    creator: string
  ) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setCreatedObjectId("");
    setDigest("");

    console.log("=== Proposal Creation Started ===");
    console.log("Parameters:", { objectId, goal, duration });
    console.log("Current account:", account?.address);

    try {
      // Format values
      const goalFormatted = toSuiU64(goal);
      const durationFormatted = daysToSeconds(duration);

      console.log("Formatted values:", {
        goalFormatted,
        durationFormatted,
        moduleId: getModuleId(),
      });

      const txb = new Transaction();

      console.log("Creating transaction block...");

      // Build the transaction
      txb.moveCall({
        target: `${MODULE_ADDRESS}::governance::create_proposal`,
        arguments: [
          txb.object(
            process.env.GOVERNANCE_ID ||
              "0xfaea00976baa8c223d4672fba0d7d255ea6cc821e92e2ed08f7fd34af037382d"
          ),
          txb.object(objectId),
          txb.pure.u64(milestoneId),
          txb.pure.string(title),
          txb.pure.string(description),
          txb.pure.u64(goalFormatted),
          txb.pure.u64(durationFormatted),
          txb.pure.u64(quorum),
          txb.pure.address(creator),
          txb.object.clock(),
        ],
      });

      console.log("Transaction block created, signing and executing...");

      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: txb },
        {
          onSuccess: async (result) => {
            console.log("Initial transaction execution successful");
            console.log("Transaction digest:", result.digest);
            setDigest(result.digest);

            try {
              console.log("Waiting for transaction confirmation...");
              const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showObjectChanges: true,
                },
              });

              console.log("Transaction confirmed");

              // Full response logging for debugging (commented out for production)
              // console.log("Full transaction response:", JSON.stringify(txResponse, null, 2));

              // Check status safely
              const txStatus = txResponse.effects?.status?.status;
              console.log("Transaction status:", txStatus);

              if (txStatus !== "success") {
                const errorMessage =
                  txResponse.effects?.status?.error || "Unknown error";
                console.error("Transaction failed with status:", errorMessage);
                throw new Error(`Transaction failed: ${errorMessage}`);
              }

              // Process object changes
              if (
                Array.isArray(txResponse.objectChanges) &&
                txResponse.objectChanges.length > 0
              ) {
                console.log(
                  `Found ${txResponse.objectChanges.length} object changes`
                );
                setObjectChanges(txResponse.objectChanges);

                // Find created objects
                const createdObjects = txResponse.objectChanges.filter(
                  (change) => change.type === "created"
                );

                if (createdObjects.length > 0) {
                  const newObjectId = createdObjects[0].objectId;
                  console.log("Created object ID:", newObjectId);
                  setCreatedObjectId(newObjectId);

                  // Optional: Get more details about the created object
                  try {
                    const objectInfo = await suiClient.getObject({
                      id: newObjectId,
                      options: { showContent: true },
                    });
                    console.log("Created object details:", objectInfo);
                  } catch (objError) {
                    console.warn("Could not fetch object details");
                  }
                } else {
                  console.log("No objects were created in this transaction");
                }
              } else {
                console.log("No object changes in transaction response");
              }

              console.log("=== Campaign Creation Complete ===");
            } catch (confirmError) {
              console.error("Error confirming transaction:", confirmError);
              setError(new Error(`Transaction confirmation failed`));
            } finally {
              setIsLoading(false);
            }
          },
          onError: (execError) => {
            console.error("Transaction execution failed:", execError);
            setError(
              new Error(`Failed to execute transaction: ${execError.message}`)
            );
            setIsLoading(false);
          },
        }
      );
    } catch (setupError) {
      console.error("Error setting up transaction:", setupError);
      setError(new Error(`Transaction setup failed: `));
      setIsLoading(false);
    }
  };

  return {
    sign_to_create_proposal,
    digest,
    createdObjectId,
    objectChanges,
    isLoading,
    error,
  };
};

export const useVoteMilestone = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectChanges, setObjectChanges] = useState<SuiObjectChange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const sign_to_vote = async (
    objectId: string,
    milestone_id: number,
    choice: boolean
  ) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setDigest("");

    console.log("=== Voting Transaction Started ===");
    console.log("Parameters:", { objectId, milestone_id, choice });
    console.log("Current account:", account?.address);

    try {
      const txb = new Transaction();

      console.log("Creating transaction block...");

      // Build the transaction
      txb.moveCall({
        target: `${getModuleId()}::vote_milestone`,
        arguments: [
          txb.object(objectId),
          txb.pure.u64(milestone_id),
          txb.pure.bool(choice),
          txb.object.clock(),
        ],
      });

      console.log("Transaction block created, signing and executing...");

      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: txb },
        {
          onSuccess: async (result) => {
            console.log("Initial transaction execution successful");
            console.log("Transaction digest:", result.digest);
            setDigest(result.digest);

            try {
              console.log("Waiting for transaction confirmation...");
              const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showObjectChanges: true,
                },
              });

              console.log("Transaction confirmed");

              // Full response logging for debugging (commented out for production)
              // console.log("Full transaction response:", JSON.stringify(txResponse, null, 2));

              // Check status safely
              const txStatus = txResponse.effects?.status?.status;
              console.log("Transaction status:", txStatus);

              if (txStatus !== "success") {
                const errorMessage =
                  txResponse.effects?.status?.error || "Unknown error";
                console.error("Transaction failed with status:", errorMessage);
                throw new Error(`Transaction failed: ${errorMessage}`);
              }

              // Process object changes
              if (
                Array.isArray(txResponse.objectChanges) &&
                txResponse.objectChanges.length > 0
              ) {
                console.log(
                  `Found ${txResponse.objectChanges.length} object changes`
                );
                setObjectChanges(txResponse.objectChanges);
              } else {
                console.log("No object changes in transaction response");
              }

              console.log("=== Contribution Complete ===");
            } catch (confirmError) {
              console.error("Error confirming transaction:", confirmError);
              setError(new Error(`Transaction confirmation failed`));
            } finally {
              setIsLoading(false);
            }
          },
          onError: (execError) => {
            console.error("Transaction execution failed:", execError);
            setError(
              new Error(`Failed to execute transaction: ${execError.message}`)
            );
            setIsLoading(false);
          },
        }
      );
    } catch (setupError) {
      console.error("Error setting up transaction:", setupError);
      setError(new Error(`Transaction setup failed: `));
      setIsLoading(false);
    }
  };

  return {
    sign_to_vote,
    digest,
    objectChanges,
    isLoading,
    error,
  };
};

export const useClaimMilestoneFund = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectChanges, setObjectChanges] = useState<SuiObjectChange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const sign_to_claim = async (objectId: string, milestone_id: number) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setDigest("");

    console.log("=== Claiming Transaction Started ===");
    console.log("Parameters:", { objectId, milestone_id });
    console.log("Current account:", account?.address);

    try {
      const txb = new Transaction();

      console.log("Creating transaction block...");

      // Build the transaction
      txb.moveCall({
        target: `${getModuleId()}::claim_milestone_fund`,
        arguments: [
          txb.object(objectId),
          txb.pure.u64(milestone_id),
          txb.object.clock(),
        ],
      });

      console.log("Transaction block created, signing and executing...");

      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: txb },
        {
          onSuccess: async (result) => {
            console.log("Initial transaction execution successful");
            console.log("Transaction digest:", result.digest);
            setDigest(result.digest);

            try {
              console.log("Waiting for transaction confirmation...");
              const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showObjectChanges: true,
                },
              });

              console.log("Transaction confirmed");

              // Full response logging for debugging (commented out for production)
              // console.log("Full transaction response:", JSON.stringify(txResponse, null, 2));

              // Check status safely
              const txStatus = txResponse.effects?.status?.status;
              console.log("Transaction status:", txStatus);

              if (txStatus !== "success") {
                const errorMessage =
                  txResponse.effects?.status?.error || "Unknown error";
                console.error("Transaction failed with status:", errorMessage);
                throw new Error(`Transaction failed: ${errorMessage}`);
              }

              // Process object changes
              if (
                Array.isArray(txResponse.objectChanges) &&
                txResponse.objectChanges.length > 0
              ) {
                console.log(
                  `Found ${txResponse.objectChanges.length} object changes`
                );
                setObjectChanges(txResponse.objectChanges);
              } else {
                console.log("No object changes in transaction response");
              }

              console.log("=== Claiming Complete ===");
            } catch (confirmError) {
              console.error("Error confirming transaction:", confirmError);
              setError(new Error(`Transaction confirmation failed`));
            } finally {
              setIsLoading(false);
            }
          },
          onError: (execError) => {
            console.error("Transaction execution failed:", execError);
            setError(
              new Error(`Failed to execute transaction: ${execError.message}`)
            );
            setIsLoading(false);
          },
        }
      );
    } catch (setupError) {
      console.error("Error setting up transaction:", setupError);
      setError(new Error(`Transaction setup failed: `));
      setIsLoading(false);
    }
  };

  return {
    sign_to_claim,
    digest,
    objectChanges,
    isLoading,
    error,
  };
};

export interface FieldProps {
  id: string;
  blob_id: string;
  creator: string;
  goal: bigint;
  raised: bigint;
  balance: bigint;
  duration: number;
  deadline: number;
  admin: string;
  status: number;
  quorum_percentage: number;
  contributors: Map<string, number>;
  milestones: Map<bigint, boolean>;
  milestone_amounts: Map<bigint, bigint>;
  milestone_votes: Map<bigint, Map<string, boolean>>;
  milestone_vote_weights: Map<bigint, bigint>;
  released_milestones: Map<bigint, boolean>;
}

export const useGetObject = () => {
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const get_object_fields = async (objectId: string) => {
    // Reset states

    try {
      const object = await suiClient.getObject({
        id: objectId,
        options: {
          showContent: true,
        },
      });
      const content = object.data?.content;

      if (content && content.dataType === "moveObject") {
        const fields = content.fields as Record<string, any>;

        const parsed: FieldProps = {
          id: fields.id.id as string,
          blob_id: blobArrayToString(fields.blob_id),
          creator: fields.creator as string,
          goal: BigInt(fields.goal as string),
          raised: BigInt(fields.raised as string),
          balance: BigInt(fields.balance as string),
          duration: Number(fields.deadline as string),
          deadline: Number(fields.deadline as string),
          admin: fields.admin as string,
          status: Number(fields.status as string),
          quorum_percentage: Number(fields.quorum_percentage as string),
          contributors: transformContributors(fields.contributors),
          milestones: transformMilestones(fields.milestones),
          milestone_amounts: transformMilestoneAmountOrVoteWeight(
            fields.milestone_amounts
          ),
          milestone_votes: transformMilestoneVotes(fields.milestone_votes),
          milestone_vote_weights: transformMilestoneAmountOrVoteWeight(
            fields.milestone_vote_weights
          ),
          released_milestones: transformMilestones(fields.released_milestones),
        };

        console.log("Parsed Fields:", parsed);
        return parsed;
      } else {
        console.error("Not moveObject or Object has no content.");
        return null;
      }
    } catch (setupError) {
      console.error("Error getting fields:", setupError);
    }
  };

  return {
    get_object_fields,
  };
};

export interface NftFieldProps {
  id: string;
  campaign_id: string;
  contributor: string;
  image_url: string;
  metadata_url: string;
  name: string;
}

export const useGetNft = () => {
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const get_nft_fields = async (objectId: string) => {
    try {
      const object = await suiClient.getObject({
        id: objectId,
        options: {
          showContent: true,
        },
      });
      const content = object.data?.content;

      if (content && content.dataType === "moveObject") {
        const fields = content.fields as Record<string, any>;

        const parsed: NftFieldProps = {
          id: fields.id.id as string,
          campaign_id: fields.campaign_id as string,
          contributor: fields.contributor as string,
          image_url: fields.image_url as string,
          metadata_url: fields.metadata_url as string,
          name: fields.name as string,
        };

        console.log("Parsed Fields:", parsed);
        return parsed;
      } else {
        console.error("Not moveObject or Object has no content.");
        return null;
      }
    } catch (setupError) {
      console.error("Error getting fields:", setupError);
    }
  };

  const get_all_nfts = async (address: string): Promise<NftFieldProps[]> => {
    try {
      const resp = await suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType:
            "0xbbfac22b0569bf81ba7280954092a04dce282e96cc9bc6f285f168514c49a902::fundx_nft::FundXContributionNFT",
        },
        options: {
          showType: true,
          showContent: true,
        },
      });

      const nftObjects = resp.data ?? [];

      const allNfts = await Promise.all(
        nftObjects.map(async (obj) => {
          const id = obj.data?.objectId;
          if (id) {
            return await get_nft_fields(id);
          }
          return null;
        })
      );

      return allNfts.filter((nft): nft is NftFieldProps => nft !== null);
    } catch (error) {
      console.error("Error fetching user FundX NFTs:", error);
      return [];
    }
  };

  return {
    get_nft_fields,
    get_all_nfts,
  };
};

// Safer formatting functions
export function toSuiU64(amount: number): string {
  if (isNaN(amount) || amount < 0) {
    throw new Error(`Invalid SUI amount: ${amount}`);
  }

  try {
    const scaled = BigInt(Math.floor(amount * 1e9));
    return scaled.toString();
  } catch (error) {
    throw new Error(`Error converting ${amount} to SUI U64:`);
  }
}

export function fromSuiU64(u64BigInt: bigint): number {
  try {
    const result = Number(u64BigInt) / 1e9;
    return result;
  } catch (error) {
    throw new Error(`Error converting ${u64BigInt} from SUI U64:`);
  }
}

function daysToSeconds(days: number): string {
  if (isNaN(days) || days < 0) {
    throw new Error(`Invalid duration: ${days}`);
  }

  try {
    const sec = BigInt(Math.floor(days * 24 * 60 * 60));
    return sec.toString();
  } catch (error) {
    throw new Error(`Error converting ${days} days to seconds: `);
  }
}

function transformContributors(contributorsField: any) {
  const contents = contributorsField?.fields?.contents ?? [];
  const result = new Map<string, number>();
  for (const item of contents) {
    const key = item.fields.key as string;
    const value = BigInt(item.fields.value as string);
    const amount = fromSuiU64(value);
    result.set(key, amount);
  }
  return result;
}

function transformMilestones(milestonesField: any) {
  const contents = milestonesField?.fields?.contents ?? [];
  const result = new Map<bigint, boolean>();
  for (const item of contents) {
    const key = BigInt(item.fields.key as string);
    const value = item.fields.value as boolean;
    result.set(key, value);
  }
  return result;
}

function transformMilestoneVotes(milestonesVotesField: any) {
  const contents = milestonesVotesField?.fields?.contents ?? [];
  const result = new Map<bigint, Map<string, boolean>>();
  for (const milestoneVoteEntry of contents) {
    const milestoneId = BigInt(milestoneVoteEntry.fields.key as string);
    const votesMapField = milestoneVoteEntry.fields.value;
    const voteContents = votesMapField?.fields?.contents ?? [];
    const votes = new Map<string, boolean>();

    for (const voteEntry of voteContents) {
      const voterAddress = voteEntry.fields.key as string;
      const hasVoted = voteEntry.fields.value as boolean;
      votes.set(voterAddress, hasVoted);
    }
    result.set(milestoneId, votes);
  }
  return result;
}

function transformMilestoneAmountOrVoteWeight(milestoneField: any) {
  const contents = milestoneField?.fields?.contents ?? [];
  const result = new Map<bigint, bigint>();
  for (const item of contents) {
    const key = BigInt(item.fields.key as string);
    const value = BigInt(item.fields.value as string);
    result.set(key, value);
  }
  return result;
}

function blobArrayToString(blob: number[]): string {
  return String.fromCharCode(...blob);
}
