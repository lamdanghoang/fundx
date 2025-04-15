"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  AlertCircle,
  ChevronRight,
  Link as LinkIcon,
  Share2,
  Heart,
} from "lucide-react";
import { mockCampaigns } from "@/data/mockCampaigns";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();

  // In a real app, fetch the campaign by ID from an API or blockchain
  const campaign = mockCampaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="container py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The campaign you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild>
          <a href="/discover">Browse Campaigns</a>
        </Button>
      </div>
    );
  }

  const progress = (campaign.raisedAmount / campaign.targetAmount) * 100;

  return (
    <div className="container py-8 px-4 md:px-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <a href="/discover" className="hover:text-foreground">
          Discover
        </a>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{campaign.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video w-full overflow-hidden rounded-lg shadow-md">
            <Image
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
              width={500}
              height={500}
            />
          </div>

          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage
                    src={`https://picsum.photos/seed/${campaign.creator.name}/100`}
                  />
                  <AvatarFallback>
                    {campaign.creator.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{campaign.creator.name}</span>
              </div>
              <div className="text-xs px-2 py-1 bg-brand-100 text-brand-800 rounded-full">
                {campaign.category}
              </div>
            </div>
          </div>

          <Tabs defaultValue="story" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="story">Story</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="backers">Backers</TabsTrigger>
            </TabsList>

            <TabsContent value="story" className="pt-4">
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed">
                  {campaign.description}
                </p>

                <h3 className="text-xl font-bold mt-6 mb-3">
                  About the Project
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl,
                  vel aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel
                  ultricies lacinia, nisl nisl aliquam nisl, vel aliquam nisl
                  nisl sit amet nisl.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-3">The Challenge</h3>
                <p>
                  Curabitur blandit tempus porttitor. Nullam quis risus eget
                  urna mollis ornare vel eu leo. Nullam id dolor id nibh
                  ultricies vehicula ut id elit. Donec ullamcorper nulla non
                  metus auctor fringilla.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-3">Our Solution</h3>
                <p>
                  Maecenas sed diam eget risus varius blandit sit amet non
                  magna. Donec ullamcorper nulla non metus auctor fringilla.
                  Etiam porta sem malesuada magna mollis euismod. Vestibulum id
                  ligula porta felis euismod semper.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-3">Roadmap</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-green-500 h-6 w-6 rounded-full flex items-center justify-center text-white mr-3 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold">Phase 1: Research & Design</h4>
                      <p className="text-muted-foreground">
                        Completed on October 15, 2024
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-brand-500 h-6 w-6 rounded-full flex items-center justify-center text-white mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold">Phase 2: Development</h4>
                      <p className="text-muted-foreground">
                        In progress - Estimated completion: January 2025
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-muted h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Phase 3: Testing & Deployment
                      </h4>
                      <p className="text-muted-foreground">
                        Planned - Estimated completion: March 2025
                      </p>
                    </div>
                  </li>
                </ul>

                <h3 className="text-xl font-bold mt-6 mb-3">Team</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarImage src="https://picsum.photos/seed/team1/100" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <h4 className="font-bold mt-2">Jane Doe</h4>
                    <p className="text-sm text-muted-foreground">
                      Founder & CEO
                    </p>
                  </div>
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarImage src="https://picsum.photos/seed/team2/100" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <h4 className="font-bold mt-2">John Smith</h4>
                    <p className="text-sm text-muted-foreground">CTO</p>
                  </div>
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarImage src="https://picsum.photos/seed/team3/100" />
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <h4 className="font-bold mt-2">Alice Lee</h4>
                    <p className="text-sm text-muted-foreground">Design Lead</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="updates" className="pt-4">
              <div className="space-y-6">
                <Card>
                  <CardContent>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">
                        Development Milestone Reached!
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        3 days ago
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      We&apos;re excited to announce that we&apos;ve completed
                      the first major development milestone. Here&apos;s what
                      we&apos;ve accomplished and what&apos;s coming next...
                    </p>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">
                        Thank you for helping us reach 50%!
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        1 week ago
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      We&apos;ve reached the halfway point of our funding goal!
                      This is an incredible milestone and we couldn&apos;t have
                      done it without our amazing community of backers...
                    </p>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">
                        Campaign Launch Announcement
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        2 weeks ago
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Today marks the official launch of our campaign! After
                      months of preparation, we&apos;re thrilled to finally
                      share our vision with the world and invite you to be part
                      of this journey...
                    </p>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="backers" className="pt-4">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full flex items-center p-4 border rounded-lg"
                  >
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage
                        src={`https://picsum.photos/seed/backer${i}/100`}
                      />
                      <AvatarFallback>B{i}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Backer {i + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        Contributed {(Math.random() * 1000).toFixed(0)} SUI
                      </div>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {Math.floor(Math.random() * 10) + 2} days ago
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-fit">
                  Load More Backers
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 hidden md:block">
                  <div className="w-fit text-xs px-2 py-1 bg-brand-100 text-brand-800 rounded-full">
                    {campaign.category}
                  </div>
                  <h1 className="text-3xl font-bold">{campaign.title}</h1>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={`https://picsum.photos/seed/${campaign.creator.name}/100`}
                        />
                        <AvatarFallback>
                          {campaign.creator.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{campaign.creator.name}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold">
                      {campaign.raisedAmount.toLocaleString()} SUI
                    </span>
                    <span className="text-muted-foreground">
                      of {campaign.targetAmount.toLocaleString()} SUI
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{campaign.backers} backers</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{campaign.daysLeft} days left</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full gradient-bg">
                  Back This Project
                </Button>

                <div className="hidden md:flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-card"
                  >
                    <Heart className="h-5 w-5" /> Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-card"
                  >
                    <Share2 className="h-5 w-5" /> Share
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-bold mb-3">Pledge Tiers</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg cursor-pointer hover:border-brand-500 transition-colors">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium">Early Supporter</h4>
                        <span className="text-sm font-bold">100 SUI</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Be among the first to back our project and receive
                        exclusive early access.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        127 backers • Limited (23 left)
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg cursor-pointer hover:border-brand-500 transition-colors">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium">Core Supporter</h4>
                        <span className="text-sm font-bold">500 SUI</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Get premium access and exclusive NFT commemorating your
                        contribution.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        64 backers
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg cursor-pointer hover:border-brand-500 transition-colors">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium">Premium Backer</h4>
                        <span className="text-sm font-bold">1,000 SUI</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Receive governance tokens and voting rights in project
                        decisions.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        32 backers
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="font-bold mb-3">Project Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator</span>
                  <span className="font-medium">{campaign.creator.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blockchain</span>
                  <span className="font-medium">Sui</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Smart Contract</span>
                  <div className="flex items-center">
                    <span className="font-medium truncate max-w-[120px]">
                      {campaign.creator.address}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-1"
                    >
                      <LinkIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{campaign.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Launch Date</span>
                  <span className="font-medium">April 1, 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
