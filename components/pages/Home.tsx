import React from "react";
import { Button } from "@/components/ui/button";
import CampaignHighlights from "@/components/campaign/CampaignHighlights";
import { Rocket, Gem, Shield, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for campaigns
const mockCampaigns = [
  {
    id: "crypto-garden",
    title: "CryptoGarden: Sustainable Blockchain Farm",
    description:
      "Building a sustainable farming ecosystem powered by blockchain technology and renewable energy.",
    imageUrl: "https://picsum.photos/seed/garden1/800/400",
    category: "Sustainability",
    raisedAmount: 120000,
    targetAmount: 250000,
    backers: 543,
    daysLeft: 15,
    creator: {
      name: "EcoBlockchain Ventures",
      address: "0x842d...a128",
    },
  },
  {
    id: "nft-art-gallery",
    title: "Decentralized NFT Art Gallery",
    description:
      "A virtual NFT gallery that connects artists directly with collectors, eliminating middlemen.",
    imageUrl: "https://picsum.photos/seed/art1/800/400",
    category: "Art",
    raisedAmount: 89000,
    targetAmount: 120000,
    backers: 721,
    daysLeft: 10,
    creator: {
      name: "Digital Arts DAO",
      address: "0xf532...7bc9",
    },
  },
  {
    id: "defi-education",
    title: "DeFi Education Platform",
    description:
      "Creating accessible education about decentralized finance for underserved communities worldwide.",
    imageUrl: "https://picsum.photos/seed/edu1/800/400",
    category: "Education",
    raisedAmount: 65000,
    targetAmount: 100000,
    backers: 329,
    daysLeft: 21,
    creator: {
      name: "BlockLearn Collective",
      address: "0xa723...45f6",
    },
  },
  {
    id: "clean-water-dao",
    title: "Clean Water DAO",
    description:
      "Using blockchain tech to fund and track clean water projects in developing nations.",
    imageUrl: "https://picsum.photos/seed/water1/800/400",
    category: "Charity",
    raisedAmount: 156000,
    targetAmount: 200000,
    backers: 892,
    daysLeft: 7,
    creator: {
      name: "WaterChain Foundation",
      address: "0xd231...88c4",
    },
  },
  {
    id: "quantum-computing-research",
    title: "Quantum Computing Simulator",
    description:
      "Building an open-source quantum computing simulator to democratize quantum research.",
    imageUrl: "https://picsum.photos/seed/quantum1/800/400",
    category: "Technology",
    raisedAmount: 432000,
    targetAmount: 500000,
    backers: 1243,
    daysLeft: 12,
    creator: {
      name: "Quantum DAO",
      address: "0x913a...2f8d",
    },
  },
  {
    id: "music-nft-platform",
    title: "Independent Music NFT Platform",
    description:
      "Empowering independent musicians to monetize their work directly through NFTs and token economies.",
    imageUrl: "https://picsum.photos/seed/music1/800/400",
    category: "Music",
    raisedAmount: 72000,
    targetAmount: 150000,
    backers: 486,
    daysLeft: 18,
    creator: {
      name: "SoundToken Collective",
      address: "0x621f...9a3e",
    },
  },
];

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
  // For demo purposes, we're using the same data for all tabs
  const trendingCampaigns = [...mockCampaigns];
  const newCampaigns = [...mockCampaigns].sort(() => Math.random() - 0.5);
  const endingSoonCampaigns = [...mockCampaigns].sort(
    (a, b) => a.daysLeft - b.daysLeft
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-100/30 to-fund-100/30 -z-10" />
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight gradient-text">
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
                  <Button size="lg" variant="outline">
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
                  fill
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
              Revolutionizing crowdfunding with blockchain technology
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background p-6 rounded-lg shadow-sm border"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <CampaignHighlights
            trendingCampaigns={trendingCampaigns}
            newCampaigns={newCampaigns}
            endingSoonCampaigns={endingSoonCampaigns}
          />
          <div className="mt-8 text-center">
            <Link href="/discover">
              <Button variant="outline" size="lg">
                View All Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-fund-600 text-white">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to FundX?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join our community of creators and backers to bring innovative ideas
            to life through decentralized funding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button variant="secondary" size="lg">
                Start a Campaign
              </Button>
            </Link>
            <Link href="/discover">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-white border-white hover:bg-white/10"
              >
                Support a Project
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
