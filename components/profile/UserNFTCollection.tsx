"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { NftFieldProps } from "@/hooks/useFundXContract";
import Image from "next/image";
import { Tag } from "lucide-react";
import { formatAddress } from "@mysten/sui/utils";

// interface NFT {
//   id: string;
//   name: string;
//   imageUrl: string;
//   campaign: string;
//   campaignId: string;
//   rarity: string;
//   acquiredDate: string;
//   currentPrice: number | null;
//   isStaked: boolean;
// }

interface UserNFTCollectionProps {
  nfts: NftFieldProps[];
}

// Helper function to determine badge color based on NFT rarity
// const getRarityColor = (rarity: string): string => {
//   switch (rarity.toLowerCase()) {
//     case "legendary":
//       return "bg-amber-500 hover:bg-amber-400";
//     case "epic":
//       return "bg-purple-500 hover:bg-purple-400";
//     case "rare":
//       return "bg-blue-500 hover:bg-blue-400";
//     case "uncommon":
//       return "bg-green-500 hover:bg-green-400";
//     default:
//       return "bg-gray-500 hover:bg-gray-400";
//   }
// };

const UserNFTCollection = ({ nfts }: UserNFTCollectionProps) => {
  // const [selectedNFT, setSelectedNFT] = useState<NftFieldProps | null>(null);
  // const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  // const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  // const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  // const [price, setPrice] = useState("");

  // Mock functions for NFT actions
  // const handleSetPrice = () => {
  //   if (!price || isNaN(Number(price)) || Number(price) <= 0) {
  //     toast.error("Please enter a valid price");
  //     return;
  //   }

  //   toast.success(`Price set for ${selectedNFT?.name}: ${price} SUI`);
  //   setIsPriceDialogOpen(false);
  //   setPrice("");
  // };

  // const handleBuyNFT = () => {
  //   if (!selectedNFT) return;

  //   toast.success(
  //     `Successfully purchased ${selectedNFT.name} for ${selectedNFT.currentPrice} SUI`
  //   );
  //   setIsBuyDialogOpen(false);
  // };

  // const handleToggleStake = () => {
  //   if (!selectedNFT) return;

  //   const action = selectedNFT.isStaked ? "unstaked" : "staked";
  //   toast.success(`Successfully ${action} ${selectedNFT.name}`);
  //   setIsStakeDialogOpen(false);
  // };

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          You don&apos;t have any NFTs yet.
        </p>
        <Link href="/discover">
          <Button>Back Campaigns to Earn NFTs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:w-[1024px]">
        {nfts.map((nft, index) => (
          <Card
            key={index}
            className="overflow-hidden flex flex-col w-full pt-0"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={nft.image_url}
                alt={nft.name}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
              {/* <Badge
                className={`absolute top-2 right-2 ${getRarityColor(
                  nft.rarity
                )} text-white`}
              >
                {nft.rarity}
              </Badge>
              {nft.isStaked && (
                <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-500">
                  Staked
                </Badge>
              )} */}
            </div>

            <CardContent className="flex-grow">
              <h3 className="font-bold mb-1">{nft.name}</h3>
              <Link
                href={`/campaign/${nft.campaign_id}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                From: Campaign {formatAddress(nft.campaign_id)}
              </Link>

              {/* <div className="mt-2 text-sm">
                <p className="text-muted-foreground">
                  Acquired: {new Date(nft.acquiredDate).toLocaleDateString()}
                </p>
                {nft.currentPrice ? (
                  <p className="font-medium text-green-600 mt-1">
                    Listed: {nft.currentPrice} SUI
                  </p>
                ) : (
                  <p className="text-muted-foreground mt-1">
                    Not listed for sale
                  </p>
                )}
              </div> */}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="flex-1" disabled>
                <Tag className="mr-1 h-4 w-4" />
                Sell
              </Button>
              <Button size="sm" variant="outline" className="flex-1" disabled>
                <Tag className="mr-1 h-4 w-4" />
                Transfer
              </Button>
            </CardFooter>

            {/* <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
              {!nft.currentPrice ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedNFT(nft);
                    setIsPriceDialogOpen(true);
                  }}
                >
                  <Tag className="mr-1 h-4 w-4" />
                  Set Price
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedNFT(nft);
                    setIsPriceDialogOpen(true);
                  }}
                >
                  <Tag className="mr-1 h-4 w-4" />
                  Update Price
                </Button>
              )}

              {nft.currentPrice && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedNFT(nft);
                    setIsBuyDialogOpen(true);
                  }}
                >
                  <Wallet className="mr-1 h-4 w-4" />
                  Buy
                </Button>
              )}

              <Button
                size="sm"
                variant={nft.isStaked ? "destructive" : "secondary"}
                className="flex-1"
                onClick={() => {
                  setSelectedNFT(nft);
                  setIsStakeDialogOpen(true);
                }}
              >
                <CoinsIcon className="mr-1 h-4 w-4" />
                {nft.isStaked ? "Unstake" : "Stake"}
              </Button>
            </CardFooter> */}
          </Card>
        ))}
      </div>

      {/* Set Price Dialog */}
      {/* <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Price for {selectedNFT?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price in SUI</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPriceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSetPrice}>Set Price</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Buy NFT Dialog */}
      {/* <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy NFT</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to buy{" "}
              <span className="font-bold">{selectedNFT?.name}</span> for{" "}
              <span className="font-bold">{selectedNFT?.currentPrice} SUI</span>
              ?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuyNFT}>Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Stake NFT Dialog */}
      {/* <Dialog open={isStakeDialogOpen} onOpenChange={setIsStakeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedNFT?.isStaked ? "Unstake NFT" : "Stake NFT"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedNFT?.isStaked ? (
              <p>
                Are you sure you want to unstake{" "}
                <span className="font-bold">{selectedNFT?.name}</span>? You will
                stop earning rewards.
              </p>
            ) : (
              <p>
                Are you sure you want to stake{" "}
                <span className="font-bold">{selectedNFT?.name}</span>? This
                will lock your NFT but earn you staking rewards.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStakeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleToggleStake}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default UserNFTCollection;
