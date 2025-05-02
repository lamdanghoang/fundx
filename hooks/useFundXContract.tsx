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
  "0x88ef7aa57e4f67c8afbf7164db7ab265b9956ba9ab3db3896c727ff87ead68de";
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
  const sign_to_contribute = async (objectId: string, amount: number) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setDigest("");

    console.log("=== Contribution Transaction Started ===");
    console.log("Parameters:", { objectId, amount });
    console.log("Current account:", account?.address);

    try {
      // Format values
      const amountFormatted = toSuiU64(amount);

      console.log("Formatted values:", {
        objectId,
        amountFormatted,
        moduleId: getModuleId(),
      });

      const txb = new Transaction();

      const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountFormatted)]); // SUI

      console.log("Creating transaction block...");

      // Build the transaction
      txb.moveCall({
        target: `${getModuleId()}::contribute`,
        arguments: [
          txb.object(objectId),
          coin,
          txb.pure.u64(amountFormatted),
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
    sign_to_contribute,
    digest,
    objectChanges,
    isLoading,
    error,
  };
};

export interface FieldProps {
  admin: string;
  balance: bigint;
  blob_id: string;
  contributors: Map<string, number>;
  creator: string;
  deadline: number;
  goal: bigint;
  id: string;
  milestones: Map<bigint, boolean>;
  raised: bigint;
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
          admin: fields.admin as string,
          balance: BigInt(fields.balance as string),
          blob_id: blobArrayToString(fields.blob_id),
          contributors: transformContributors(fields.contributors),
          creator: fields.creator as string,
          deadline: Number(fields.deadline as string),
          goal: BigInt(fields.goal as string),
          id: fields.id.id as string,
          milestones: transformMilestones(fields.milestones),
          raised: BigInt(fields.raised as string),
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

function blobArrayToString(blob: number[]): string {
  return String.fromCharCode(...blob);
}
