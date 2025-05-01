"use client";
import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { Wallet } from "lucide-react";
import "@mysten/dapp-kit/dist/index.css";
import { cn } from "@/lib/utils";

interface CustomBtnProps {
  className?: string;
}

export function CustomBtn({ className }: CustomBtnProps) {
  const [open, setOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  if (currentAccount)
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full mt-2 md:mt-0 md:w-40 md:inline-flex gradient-bg text-white",
          className
        )}
        onClick={() => disconnect()}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {formatAddress(currentAccount.address)}
      </Button>
    );

  return (
    <ConnectModal
      trigger={
        <Button
          className={cn(
            "w-full mt-2 md:mt-0 md:w-40 md:inline-flex gradient-bg",
            className
          )}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      }
      open={open}
      onOpenChange={(isOpen) => setOpen(isOpen)}
    />
  );
}
