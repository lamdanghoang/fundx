"use client";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useEffect, useState } from "react";

const MODULE_ADDRESS =
  "0xaf80ca657630b8c26060cb827c547525722b76e567779f16f7fee69979c37f47";
const MODULE_NAME = "fundx";

// Helper function to get the full module ID
const getModuleId = () => `${MODULE_ADDRESS}::${MODULE_NAME}`;

export const useCreateCampaign = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectId, setObjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { waitForTransaction } = useSuiClient();

  const sign_to_create_campaign = (
    blobId: string,
    goal: number,
    duration: number
  ) => {
    setError(null);
    setIsLoading(true);

    const txb = new Transaction();

    txb.moveCall({
      target: `${getModuleId()}::create_campaign`,
      arguments: [
        txb.pure.string(blobId),
        txb.pure.u64(toSuiU64(goal)),
        txb.pure.u64(daysToSeconds(duration)),
        txb.object.clock(),
      ],
    });

    signAndExecuteTransaction(
      {
        transaction: txb,
      },
      {
        onSuccess: async (result) => {
          console.log("executed transaction", result);
          setDigest(result.digest);

          try {
            const res: SuiTransactionBlockResponse = await waitForTransaction({
              digest: result.digest,
            });
            const objects = res.objectChanges || [];
            const object = objects.find((obj) => obj.type === "created");
            console.log(object);
            if (!object) return;
            setObjectId(object.objectId);
          } catch (error) {
            console.log("Cannot find this object id");
          }

          setIsLoading(false);
        },
        onError: (err) => {
          console.error("Error creating campaign:", err);
          setError(err);
          setIsLoading(false);
        },
      }
    );
  };

  return {
    sign_to_create_campaign,
    digest,
    objectId,
    isLoading,
    error,
  };
};

export function toSuiU64(amount: number): string {
  if (isNaN(amount) || amount < 0) {
    throw new Error("Invalid SUI amount");
  }

  const scaled = BigInt(Math.floor(amount * 1e9));
  return scaled.toString(); // Use this with txb.pure.u64(...)
}

function daysToSeconds(days: number): string {
  if (isNaN(days) || days < 0) {
    throw new Error("Invalid duration");
  }

  const sec = BigInt(Math.floor(days * 24 * 60 * 60)); // days → s
  return sec.toString(); // Use with txb.pure.u64(...)
}
