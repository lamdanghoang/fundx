"use client";
import { useState } from "react";
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
import Link from "next/link";
import { storeBlob, createCampaign } from "@/lib/api";
import MultiFileUploader from "@/components/pages/create/Uploader";

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
  storyFields: z
    .array(
      z.object({
        title: z.string().min(1, { message: "Section title is required" }),
        content: z.string().min(1, { message: "Section content is required" }),
      })
    )
    .optional(),
  roadmapPhases: z
    .array(
      z.object({
        title: z.string().min(1, { message: "Phase title is required" }),
        timeline: z.string().min(1, { message: "Timeline is required" }),
        description: z.string().min(1, { message: "Description is required" }),
      })
    )
    .optional(),
  teams: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Name is required" }),
        role: z.string().min(1, { message: "Role is required" }),
        contact: z.object({
          email: z.string().optional(),
          twitter: z.string().optional(),
          telegram: z.string().optional(),
        }),
      })
    )
    .optional(),
  galleryImages: z.array(z.string()).optional(),
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
      storyFields: [{ title: "", content: "" }],
      roadmapPhases: [{ title: "", timeline: "", description: "" }],
      teams: [
        {
          name: "",
          role: "",
          contact: { email: "", twitter: "", telegram: "" },
        },
      ],
      galleryImages: [],
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
      // Only trigger validation on the required fields
      const isDetailsValid = await form.trigger(["targetAmount", "duration"]);
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setIsSuccess(false);

      // Store campaign data in blob
      const blobResult = await storeBlob(values);

      // Create campaign in database
      const campaignResult = await createCampaign({
        ...values,
        blobId: blobResult.id,
      });

      console.log(campaignResult);

      setIsSuccess(true);
    } catch (error) {
      console.error("Error creating campaign:", error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
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
              <Link href="/cLinkmpaign/new-campaign">View Your Campaign</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
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
              <CardContent>
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
                          <FormItem className="text-lg">
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
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel>Campaign Story</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentFields =
                                form.getValues().storyFields || [];
                              form.setValue("storyFields", [
                                ...currentFields,
                                { title: "", content: "" },
                              ]);
                            }}
                          >
                            Add Section
                          </Button>
                        </div>
                        <FormDescription>
                          Tell your story by adding sections about your project,
                          challenges, solutions, etc.
                        </FormDescription>

                        {(form.watch("storyFields") || []).length > 0 ? (
                          <div className="space-y-4">
                            {(form.watch("storyFields") || []).map(
                              (field, index) => (
                                <div
                                  key={index}
                                  className="border rounded-lg p-4 space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <Input
                                      placeholder="Section Title (e.g. About the Project)"
                                      value={field.title}
                                      onChange={(e) => {
                                        const currentFields = [
                                          ...(form.getValues().storyFields ||
                                            []),
                                        ];
                                        if (currentFields[index]) {
                                          currentFields[index].title =
                                            e.target.value;
                                          form.setValue(
                                            "storyFields",
                                            currentFields
                                          );
                                        }
                                      }}
                                      className="max-w-md"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const currentFields =
                                          form.getValues().storyFields || [];
                                        const newFields = currentFields.filter(
                                          (_, i) => i !== index
                                        );
                                        form.setValue("storyFields", newFields);
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <Textarea
                                    placeholder="Write the content for this section"
                                    value={field.content}
                                    onChange={(e) => {
                                      const currentFields = [
                                        ...(form.getValues().storyFields || []),
                                      ];
                                      if (currentFields[index]) {
                                        currentFields[index].content =
                                          e.target.value;
                                        form.setValue(
                                          "storyFields",
                                          currentFields
                                        );
                                      }
                                    }}
                                    rows={4}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="border border-dashed rounded-lg p-6 text-center">
                            <p className="text-muted-foreground">
                              Add sections to tell your story in an organized
                              way
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Add Roadmap section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel>Project Roadmap</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentPhases =
                                form.getValues().roadmapPhases || [];
                              form.setValue("roadmapPhases", [
                                ...currentPhases,
                                { title: "", timeline: "", description: "" },
                              ]);
                            }}
                          >
                            Add Phase
                          </Button>
                        </div>
                        <FormDescription>
                          Outline your project timeline and milestones
                        </FormDescription>

                        {(form.watch("roadmapPhases") || []).length > 0 ? (
                          <div className="space-y-4">
                            {(form.watch("roadmapPhases") || []).map(
                              (phase, index) => (
                                <div
                                  key={index}
                                  className="border rounded-lg p-4 space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="w-full flex items-center space-x-2">
                                      <div className="bg-brand-100 text-brand-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                      </div>
                                      <div className="max-w-40">
                                        <Input
                                          placeholder="Phase Title"
                                          value={phase.title}
                                          onChange={(e) => {
                                            const currentPhases = [
                                              ...(form.getValues()
                                                .roadmapPhases || []),
                                            ];
                                            if (currentPhases[index]) {
                                              currentPhases[index].title =
                                                e.target.value;
                                              form.setValue(
                                                "roadmapPhases",
                                                currentPhases
                                              );
                                            }
                                          }}
                                          className="max-w-xs"
                                        />
                                      </div>
                                      <div className="max-w-40">
                                        <Input
                                          placeholder="Timeline (e.g. Q1 2024)"
                                          value={phase.timeline}
                                          onChange={(e) => {
                                            const currentPhases = [
                                              ...(form.getValues()
                                                .roadmapPhases || []),
                                            ];
                                            if (currentPhases[index]) {
                                              currentPhases[index].timeline =
                                                e.target.value;
                                              form.setValue(
                                                "roadmapPhases",
                                                currentPhases
                                              );
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const currentPhases =
                                          form.getValues().roadmapPhases || [];
                                        const newPhases = currentPhases.filter(
                                          (_, i) => i !== index
                                        );
                                        form.setValue(
                                          "roadmapPhases",
                                          newPhases
                                        );
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3">
                                    <div className="">
                                      <Textarea
                                        placeholder="Describe what will be accomplished in this phase"
                                        value={phase.description}
                                        onChange={(e) => {
                                          const currentPhases = [
                                            ...(form.getValues()
                                              .roadmapPhases || []),
                                          ];
                                          if (currentPhases[index]) {
                                            currentPhases[index].description =
                                              e.target.value;
                                            form.setValue(
                                              "roadmapPhases",
                                              currentPhases
                                            );
                                          }
                                        }}
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="border border-dashed rounded-lg p-6 text-center">
                            <p className="text-muted-foreground">
                              Add phases to your roadmap to show backers your
                              project timeline
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Team Members section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel>Team Members</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentTeam = form.getValues().teams || [];
                              form.setValue("teams", [
                                ...currentTeam,
                                {
                                  name: "",
                                  role: "",
                                  contact: {
                                    email: "",
                                    twitter: "",
                                    telegram: "",
                                  },
                                },
                              ]);
                            }}
                          >
                            Add Team Member
                          </Button>
                        </div>
                        <FormDescription>
                          Add key team members who are working on this project
                        </FormDescription>

                        {(form.watch("teams") || []).length > 0 ? (
                          <div className="space-y-4">
                            {(form.watch("teams") || []).map(
                              (member, index) => (
                                <div
                                  key={index}
                                  className="border rounded-lg p-4 space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="w-full flex items-center space-x-2">
                                      <div className="max-w-40">
                                        <Input
                                          placeholder="Member Name"
                                          value={member.name}
                                          onChange={(e) => {
                                            const currentTeam = [
                                              ...(form.getValues().teams || []),
                                            ];
                                            if (currentTeam[index]) {
                                              currentTeam[index].name =
                                                e.target.value;
                                              form.setValue(
                                                "teams",
                                                currentTeam
                                              );
                                            }
                                          }}
                                          className="max-w-xs"
                                        />
                                      </div>
                                      <div className="max-w-40">
                                        <Input
                                          placeholder="Role (e.g. Developer, Designer)"
                                          value={member.role}
                                          onChange={(e) => {
                                            const currentTeam = [
                                              ...(form.getValues().teams || []),
                                            ];
                                            if (currentTeam[index]) {
                                              currentTeam[index].role =
                                                e.target.value;
                                              form.setValue(
                                                "teams",
                                                currentTeam
                                              );
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const currentTeam =
                                          form.getValues().teams || [];
                                        const newTeam = currentTeam.filter(
                                          (_, i) => i !== index
                                        );
                                        form.setValue("teams", newTeam);
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground font-normal">
                                      Contact Information (Optional)
                                    </Label>
                                    <div className="flex flex-col gap-2">
                                      <div className="w-full flex items-center gap-2">
                                        <Label className="w-20 text-xs md:text-sm">
                                          Email:
                                        </Label>
                                        <Input
                                          placeholder="Email address"
                                          value={member.contact.email || ""}
                                          onChange={(e) => {
                                            const currentTeam = [
                                              ...(form.getValues().teams || []),
                                            ];
                                            if (currentTeam[index]) {
                                              currentTeam[index].contact = {
                                                ...currentTeam[index].contact,
                                                email: e.target.value,
                                              };
                                              form.setValue(
                                                "teams",
                                                currentTeam
                                              );
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Label className="w-20 text-xs md:text-sm">
                                          Twitter:
                                        </Label>
                                        <Input
                                          placeholder="Twitter handle"
                                          value={member.contact.twitter || ""}
                                          onChange={(e) => {
                                            const currentTeam = [
                                              ...(form.getValues().teams || []),
                                            ];
                                            if (currentTeam[index]) {
                                              currentTeam[index].contact = {
                                                ...currentTeam[index].contact,
                                                twitter: e.target.value,
                                              };
                                              form.setValue(
                                                "teams",
                                                currentTeam
                                              );
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Label className="w-20 text-xs md:text-sm">
                                          Telegram:
                                        </Label>
                                        <Input
                                          placeholder="Telegram username"
                                          value={member.contact.telegram || ""}
                                          onChange={(e) => {
                                            const currentTeam = [
                                              ...(form.getValues().teams || []),
                                            ];
                                            if (currentTeam[index]) {
                                              currentTeam[index].contact = {
                                                ...currentTeam[index].contact,
                                                telegram: e.target.value,
                                              };
                                              form.setValue(
                                                "teams",
                                                currentTeam
                                              );
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="border border-dashed rounded-lg p-6 text-center">
                            <p className="text-muted-foreground">
                              Add team members to showcase the people behind
                              your project
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Campaign Images Upload */}
                      <div className="space-y-4">
                        <FormLabel>Campaign Images</FormLabel>
                        <FormDescription>
                          Upload multiple images for your campaign (max 10
                          images)
                        </FormDescription>
                        <MultiFileUploader
                          id="campaign-images-upload"
                          onFilesUploaded={(urls) => {
                            form.setValue("galleryImages", urls);
                          }}
                          maxFiles={10}
                          accept="image/*"
                        />
                        {(form.watch("galleryImages") || []).length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {(form.watch("galleryImages") || []).length} images
                            uploaded
                          </div>
                        )}
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
                                The amount you&apos;need to raise in SUI
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
                            After creating your campaign, you&apos;ll be guided
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

                        {/* Display Story Sections in Review */}
                        {(form.watch("storyFields") || []).length > 0 && (
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Campaign Story</h4>
                            <div className="space-y-3 text-sm">
                              {(form.watch("storyFields") || []).map(
                                (field, index) => (
                                  <div key={index}>
                                    <p className="text-muted-foreground">
                                      {field.title}
                                    </p>
                                    <p className="font-medium">
                                      {field.content || "Not provided"}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Display Roadmap in Review */}
                        {(form.watch("roadmapPhases") || []).length > 0 && (
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">
                              Project Roadmap
                            </h4>
                            <div className="space-y-3 text-sm">
                              {(form.watch("roadmapPhases") || []).map(
                                (phase, index) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                                  >
                                    <div className="md:col-span-1">
                                      <p className="text-muted-foreground">
                                        Phase {index + 1}: {phase.title}
                                      </p>
                                      <p className="font-medium">
                                        {phase.timeline || "No timeline"}
                                      </p>
                                    </div>
                                    <div className="md:col-span-2">
                                      <p className="font-medium">
                                        {phase.description || "No description"}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Display Team Members in Review */}
                        {(form.watch("teams") || []).length > 0 && (
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Team Members</h4>
                            <div className="space-y-3 text-sm">
                              {(form.watch("teams") || []).map(
                                (member, index) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-2"
                                  >
                                    <div>
                                      <p className="text-muted-foreground">
                                        Name
                                      </p>
                                      <p className="font-medium">
                                        {member.name || "Not provided"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">
                                        Role
                                      </p>
                                      <p className="font-medium">
                                        {member.role || "Not provided"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">
                                        Contact
                                      </p>
                                      <div className="font-medium col-span-2">
                                        {member.contact.email ||
                                        member.contact.twitter ||
                                        member.contact.telegram ? (
                                          <div className="space-y-1">
                                            {member.contact.email && (
                                              <p>
                                                Email: {member.contact.email}
                                              </p>
                                            )}
                                            {member.contact.twitter && (
                                              <p>
                                                Twitter:{" "}
                                                {member.contact.twitter}
                                              </p>
                                            )}
                                            {member.contact.telegram && (
                                              <p>
                                                Telegram:{" "}
                                                {member.contact.telegram}
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          "Not provided"
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

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
                            To create your campaign on the blockchain,
                            you&apos;ll need to connect your wallet and sign the
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
