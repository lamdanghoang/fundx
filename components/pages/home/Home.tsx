"use client";
import CampaignHighlights from "@/components/campaign/CampaignHighlights";
import VotingCampaignSection from "@/components/milestone/VotingCampaignSection";
import { Rocket, Gem, Shield, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getVotingCampains } from "@/lib/api";
import { VotingCampaign } from "@/lib/interface";

const features = [
  {
    icon: <Rocket className="h-8 w-8 mb-3 text-brand-600" />,
    title: "Launch Your Dream",
    description:
      "Create and launch your campaign in minutes with smart contracts backing your project.",
  },
  {
    icon: <Shield className="h-8 w-8 mb-3 text-brand-600" />,
    title: "Secure Funding",
    description:
      "All campaigns are secured by blockchain technology ensuring transparency and trust.",
  },
  {
    icon: <Gem className="h-8 w-8 mb-3 text-brand-600" />,
    title: "Token Rewards",
    description:
      "Offer backers token rewards that can appreciate in value over time.",
  },
  {
    icon: <Globe className="h-8 w-8 mb-3 text-brand-600" />,
    title: "Global Reach",
    description:
      "Connect with backers from around the world without geographical limitations.",
  },
];

const Home = () => {
  const [votingCampaigns, setVotingCampaigns] = useState<VotingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCampaignList = async () => {
      setIsLoading(true);

      const votingCampaigns = await getVotingCampains(10, 0);
      setVotingCampaigns(votingCampaigns.data);
      setIsLoading(false);
    };
    fetchCampaignList();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-100/30 to-fund-100/30 -z-10" />
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight gradient-text md:h-25">
                FundX Blockchain Technology
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                A decentralized crowdfunding platform that connects innovative
                creators with global backers through transparent blockchain
                technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/discover">
                  <Button size="lg" className="gradient-bg">
                    Explore Campaigns
                  </Button>
                </Link>
                <Link href="/create">
                  <Button
                    size="lg"
                    variant="outline"
                    className="hover:bg-accent"
                  >
                    Start Your Campaign
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-xl shadow-xl">
                <Image
                  alt="FundX platform"
                  className="object-cover w-full h-full"
                  width={500}
                  height={500}
                  src="https://picsum.photos/seed/crowdfund1/800/450"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-background p-4 rounded-lg shadow-lg border">
                <div className="text-sm font-medium">Live Funding</div>
                <div className="text-2xl font-bold gradient-text">1.2M SUI</div>
                <div className="text-xs text-muted-foreground">
                  across 72 active campaigns
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Why Choose Our Platform
            </h2>
            <p className="text-muted-foreground text-lg">
              We combine the best of blockchain technology with crowdfunding to
              create a transparent, secure, and rewarding platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-background p-6 rounded-lg shadow-sm">
                <div>{feature.icon}</div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voting Campaigns Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  Campaigns Needing Your Vote
                </h2>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-fund-800">Loading...</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            </div>
          ) : votingCampaigns.length > 0 ? (
            <VotingCampaignSection votingCampaigns={votingCampaigns} />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  Campaigns Needing Your Vote
                </h2>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span>No campaigns</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Campaign Highlights Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <CampaignHighlights />
          {/* <div className="mt-8 text-center">
            <Link href="/discover">
              <Button variant="outline" size="lg" className="hover:bg-accent">
                View All Campaigns
              </Button>
            </Link>
          </div> */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-4 md:mb-0 py-16 bg-gradient-to-r from-brand-600 to-fund-600 text-white md:rounded-2xl">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Bring Your Idea to Life?
            </h2>
            <p className="text-lg mb-8">
              Join thousands of innovative creators who have successfully funded
              their projects through our platform.
            </p>
            <Link href="/create">
              <Button size="lg" variant="secondary">
                Start Your Campaign
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

// function CampaignCreator() {
//   const { sign_to_contribute, objectChanges, createdObjectId, isLoading } =
//     useCreateContribution();

//   // When you want to display object changes in your UI
//   return (
//     <div>
//       <button
//         onClick={() =>
//           sign_to_contribute(
//             "0x2fb34fdee4fae98e869b9eb4e151df78d94ed78a973e4042881905a3ca64d623",
//             1
//           )
//         }
//         disabled={isLoading}
//       >
//         Create Campaign
//       </button>

//       {createdObjectId && (
//         <div>
//           <h3>Created Campaign ID: {createdObjectId}</h3>
//         </div>
//       )}

//       {objectChanges.length > 0 && (
//         <div>
//           <h3>Object Changes:</h3>
//           <pre>{JSON.stringify(objectChanges, null, 2)}</pre>
//         </div>
//       )}
//     </div>
//   );
// }
