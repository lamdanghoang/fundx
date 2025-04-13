import { ConnectModal } from "@mysten/dapp-kit";
import { useState } from "react";
import { Button } from "../ui/button";
import { Wallet } from "lucide-react";
import "@mysten/dapp-kit/dist/index.css";

export function CustomBtn() {
  const [open, setOpen] = useState(false);

  return (
    <ConnectModal
      trigger={
        <Button className="w-40 hidden md:inline-flex gradient-bg">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      }
      open={open}
      onOpenChange={(isOpen) => setOpen(isOpen)}
    />
  );
}
