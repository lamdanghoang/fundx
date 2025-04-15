import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export interface CampaignProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  raisedAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
  creator: {
    name: string;
    address: string;
  };
}

const CampaignCard = ({
  id,
  title,
  description,
  imageUrl,
  category,
  raisedAmount,
  targetAmount,
  backers,
  daysLeft,
  creator,
}: CampaignProps) => {
  const progress = (raisedAmount / targetAmount) * 100;

  return (
    <Card className="pt-0 overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={500}
          height={500}
          className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {category}
        </div>
      </div>

      <CardHeader className="p-4 pb-0">
        <Link href={`/campaign/${id}`} className="hover:underline">
          <h3 className="font-bold text-lg line-clamp-2">{title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                {raisedAmount.toLocaleString()} SUI
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                Raised of {targetAmount.toLocaleString()} SUI
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{backers} backers</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          by <span className="font-medium">{creator.name}</span>
        </div>
        <Link href={`/campaign/${id}`}>
          <Button variant="secondary" size="sm">
            View Campaign
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
