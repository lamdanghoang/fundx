"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Upload,
  Wallet,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const categories = [
  "Technology",
  "Art",
  "Music",
  "Film",
  "Games",
  "Publishing",
  "Charity",
  "Education",
  "Sustainability",
];

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z
    .string()
    .min(50, { message: "Description must be at least 50 characters" }),
  story: z
    .string()
    .min(100, { message: "Project story must be at least 100 characters" }),
  targetAmount: z
    .number()
    .min(100, { message: "Target amount must be at least 100" }),
  duration: z
    .number()
    .min(7, { message: "Duration must be at least 7 days" })
    .max(90, { message: "Duration cannot exceed 90 days" }),
  rewardType: z.enum(["none", "token", "nft"]),
});

const CreateCampaign = () => {
  const [activeTab, setActiveTab] = useState("basics");
  const [formProgress, setFormProgress] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      story: "",
      targetAmount: 1000,
      duration: 30,
      rewardType: "none",
    },
  });

  const nextTab = async () => {
    if (activeTab === "basics") {
      const isBasicsValid = await form.trigger([
        "title",
        "category",
        "description",
      ]);
      if (isBasicsValid) {
        setActiveTab("details");
        setFormProgress(50);
      }
    } else if (activeTab === "details") {
      const isDetailsValid = await form.trigger([
        "story",
        "targetAmount",
        "duration",
      ]);
      if (isDetailsValid) {
        setActiveTab("rewards");
        setFormProgress(75);
      }
    } else if (activeTab === "rewards") {
      const isRewardsValid = await form.trigger(["rewardType"]);
      if (isRewardsValid) {
        setActiveTab("review");
        setFormProgress(100);
      }
    }
  };

  const prevTab = () => {
    if (activeTab === "details") {
      setActiveTab("basics");
      setFormProgress(25);
    } else if (activeTab === "rewards") {
      setActiveTab("details");
      setFormProgress(50);
    } else if (activeTab === "review") {
      setActiveTab("rewards");
      setFormProgress(75);
    }
  };

  const storeBlob = async (values: z.infer<typeof formSchema>) => {
    //     const markdown = `
    // # ${values.title}

    // **Category:** ${values.category}

    // **Description:** ${values.description}

    // ## Story

    // ${values.story}

    // **Target:** ${values.targetAmount}

    // **Duration:** ${values.duration}

    // **Reward:** ${values.rewardType}
    // `;

    // console.log("Markdown: ", markdown);
    // const blobData = new Blob([values]);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PUBLISHER}/v1/blobs?epochs=5`,
        {
          method: "PUT",
          body: JSON.stringify(values),
          headers: {
            "Content-Type": "application/octet-stream",
          },
          mode: "cors",
        }
      );

      const result = await response.json();
      console.log("Blob stored:", result);
    } catch (error) {
      console.error("Error storing blob:", error);
    }
  };

  const readBlob = async (blobId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AGGREGATOR}/v1/blobs/${blobId}`
      );
      const blob = await response.json();
      console.log("Blob content:", blob);
    } catch (error) {
      console.error("Error reading blob:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // This would be replaced with actual blockchain interaction
    console.log(values);
    // setIsSubmitting(true);
    // await storeBlob(values);
    // await readBlob("Sfla0jiQp6lBF7Yo23JjX_Idj6bmEIs0LyN9LxGeNOs");

    // Simulate API delay
    setTimeout(() => {
      //   setIsSubmitting(false);
      //   setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 text-green-800 rounded-full p-3 inline-flex">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold mt-6 mb-3">
            Campaign Created Successfully!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your campaign is now live on the blockchain and ready to receive
            funding. Share it with your network to start gathering support!
          </p>
          <div className="space-y-4">
            <Button asChild size="lg" className="gradient-bg w-full">
              <a href="/campaign/new-campaign">View Your Campaign</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <a href="/">Return to Home</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </a>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Campaign</h1>
          <p className="text-muted-foreground mt-2">
            Turn your idea into reality with blockchain-powered crowdfunding
          </p>
        </div>

        <div className="mb-8">
          <Progress value={formProgress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span
              className={
                activeTab === "basics" || formProgress >= 25
                  ? "text-foreground font-medium"
                  : ""
              }
            >
              Basics
            </span>
            <span
              className={
                activeTab === "details" || formProgress >= 50
                  ? "text-foreground font-medium"
                  : ""
              }
            >
              Details
            </span>
            <span
              className={
                activeTab === "rewards" || formProgress >= 75
                  ? "text-foreground font-medium"
                  : ""
              }
            >
              Rewards
            </span>
            <span
              className={
                activeTab === "review" || formProgress === 100
                  ? "text-foreground font-medium"
                  : ""
              }
            >
              Review
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="hidden">
                    <TabsTrigger value="basics">Basics</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                    <TabsTrigger value="review">Review</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basics">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter a clear, descriptive title"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              This is the first thing people will see. Make it
                              catchy!
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose the category that best describes your
                              project
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Provide a brief summary of your project (50-200 characters)"
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              This will appear in the campaign cards and search
                              results
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <div className="flex justify-between border-t pt-4">
                          <Button type="button" variant="outline" disabled>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                          <Button type="button" onClick={nextTab}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="story"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Story</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell your story. What are you creating? Why is it important? How will you use the funds?"
                                {...field}
                                rows={6}
                              />
                            </FormControl>
                            <FormDescription>
                              Be detailed and transparent about your project and
                              goals
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <Label>Campaign Image</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop an image, or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recommended size: 1200x630px, max 5MB (JPG, PNG)
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                          >
                            Upload Image
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="targetAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Funding Goal (SUI)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                The amount you need to raise in SUI
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Duration (Days)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                How long your campaign will run (7-90 days)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-4">
                        <div className="flex justify-between border-t pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevTab}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                          <Button type="button" onClick={nextTab}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rewards">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="rewardType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Reward Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-4"
                              >
                                <div className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:border-brand-400">
                                  <RadioGroupItem
                                    value="none"
                                    id="none"
                                    className="mt-1"
                                  />
                                  <div>
                                    <Label
                                      htmlFor="none"
                                      className="text-base font-medium"
                                    >
                                      No Rewards
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      Backers support your project without
                                      receiving specific rewards
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:border-brand-400">
                                  <RadioGroupItem
                                    value="token"
                                    id="token"
                                    className="mt-1"
                                  />
                                  <div>
                                    <Label
                                      htmlFor="token"
                                      className="text-base font-medium"
                                    >
                                      Token Rewards
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      Issue fungible tokens that can represent
                                      ownership, voting rights, or utility in
                                      your project
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start space-x-3 border p-4 rounded-lg cursor-pointer hover:border-brand-400">
                                  <RadioGroupItem
                                    value="nft"
                                    id="nft"
                                    className="mt-1"
                                  />
                                  <div>
                                    <Label
                                      htmlFor="nft"
                                      className="text-base font-medium"
                                    >
                                      NFT Rewards
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      Create unique digital collectibles to
                                      reward backers with exclusive content or
                                      benefits
                                    </p>
                                  </div>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("rewardType") !== "none" && (
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <AlertCircle className="h-5 w-5 text-brand-600 mr-2" />
                            <p className="font-medium">Reward Setup</p>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            After creating your campaign, you'll be guided
                            through the process of setting up your
                            {form.watch("rewardType") === "token"
                              ? " token"
                              : " NFT"}{" "}
                            rewards in detail, including tokenomics,
                            distribution rules, and design.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled
                          >
                            Learn More About{" "}
                            {form.watch("rewardType") === "token"
                              ? "Tokens"
                              : "NFTs"}
                          </Button>
                        </div>
                      )}

                      <div className="pt-4">
                        <div className="flex justify-between border-t pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevTab}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                          <Button type="button" onClick={nextTab}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="review">
                    <div className="space-y-6">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold">
                          Review Your Campaign
                        </h3>
                        <p className="text-muted-foreground">
                          Please review all details before creating your
                          campaign on the blockchain
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">
                            Campaign Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Title</p>
                              <p className="font-medium">
                                {form.watch("title") || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Category</p>
                              <p className="font-medium">
                                {form.watch("category") || "Not selected"}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-muted-foreground">
                                Description
                              </p>
                              <p className="font-medium">
                                {form.watch("description") || "Not provided"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Funding Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                Target Amount
                              </p>
                              <p className="font-medium">
                                {form.watch("targetAmount")} SUI
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">
                                {form.watch("duration")} days
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Reward Type
                              </p>
                              <p className="font-medium capitalize">
                                {form.watch("rewardType")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-muted/50">
                          <h4 className="font-medium mb-2">
                            Connect Wallet to Continue
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            To create your campaign on the blockchain, you'll
                            need to connect your wallet and sign the
                            transaction.
                          </p>
                          <Button type="button" className="gradient-bg">
                            <Wallet className="mr-2 h-4 w-4" />
                            Connect Wallet
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="flex justify-between border-t pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevTab}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="gradient-bg"
                          >
                            {isSubmitting ? "Creating..." : "Create Campaign"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateCampaign;
