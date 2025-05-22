"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getUserCampaigns,
  storeProposalData,
  uploadMilestone,
} from "@/lib/api";
import { Campaign } from "@/lib/interface";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCreateProposal } from "@/hooks/useFundXContract";
import { formatDigest } from "@mysten/sui/utils";

// Form schema
const proposalFormSchema = z.object({
  objectId: z.string({
    required_error: "Please select a campaign",
  }),
  campaignId: z.string(),
  milestoneId: z.string({
    required_error: "Please select a milestone",
  }),
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters",
    })
    .max(100),
  description: z
    .string()
    .min(20, {
      message: "Description must be at least 20 characters",
    })
    .max(1000),
  requestedAmount: z.number().min(1, {
    message: "Amount must be greater than 0",
  }),
  details: z
    .array(
      z.object({
        title: z.string().min(1, { message: "Section title is required" }),
        content: z.string().min(1, { message: "Section content is required" }),
      })
    )
    .min(1, { message: "Proposal details must have least 1 section" }),
  deliverables: z.string().min(10, {
    message: "Deliverables must be at least 10 characters",
  }),
  votingDurationDays: z
    .number()
    .min(1, {
      message: "Voting duration must be at least 1 day",
    })
    .max(30, {
      message: "Voting duration cannot exceed 30 days",
    }),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

const CreateProposal = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [load, setLoad] = useState(false);
  const currentAccount = useCurrentAccount();
  const { sign_to_create_proposal, isLoading, error, digest } =
    useCreateProposal();

  // Default form values
  const defaultValues: Partial<ProposalFormValues> = {
    title: "",
    description: "",
    objectId: "",
    milestoneId: "",
    deliverables: "",
    votingDurationDays: 7,
    requestedAmount: 1,
    details: [{ title: "", content: "" }],
  };

  useEffect(() => {
    if (!currentAccount) return;

    const fetchCampaigns = async () => {
      const campaigns = await getUserCampaigns(currentAccount.address);
      setCampaigns(campaigns);
    };

    fetchCampaigns();
  }, [currentAccount]);

  useEffect(() => {
    if (digest) {
      toast("Proposal creation is successful", {
        description: `Txn: ${formatDigest(digest)}`,
        action: {
          label: "View",
          onClick: () =>
            window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
        },
        style: {
          backgroundColor: "#0986f5",
        },
      });
    }
  }, [digest]);

  useEffect(() => {
    if (error) {
      toast("Voting Error. Try again", {
        description: `${error}`,
      });
    }
  }, [error]);

  // Initialize form
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues,
  });

  const selectedCampaignId = form.watch("objectId");

  // Handle form submission
  const onSubmit = async (values: ProposalFormValues) => {
    if (!currentAccount) return;
    setLoad(true);

    try {
      let informationId: string;

      try {
        informationId = await storeProposalData(values);
        console.log(
          "Successfully stored proposal data. Information ID:",
          informationId
        );
      } catch (error) {
        console.error("Failed to store proposal data:", error);
        toast.error("Failed to store proposal data. Please try again.");
        return;
      }

      // Only proceed with uploadMilestone if we successfully got informationId
      if (!informationId) {
        toast.error("Failed to get information ID. Please try again.");
        return;
      }

      const request = {
        campaignId: form.getValues("campaignId"),
        objectId: form.getValues("objectId"),
        milestoneId: form.getValues("milestoneId"),
        title: form.getValues("title"),
        description: form.getValues("description"),
        deliverables: form.getValues("deliverables"),
        amount: form.getValues("requestedAmount"),
        status: "in-voting",
        currency: "sui",
        votingDurationDays: form.getValues("votingDurationDays"),
        informationId,
      };

      console.log("Form values:", request);

      sign_to_create_proposal(
        request.objectId,
        request.milestoneId,
        request.title,
        request.informationId,
        request.amount,
        request.votingDurationDays,
        66,
        currentAccount.address
      );

      const milestoneRes = await uploadMilestone(request);
      console.log(milestoneRes);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Failed to create proposal. Please try again.");
    }
    setLoad(false);
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/active-votings">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Active Votings
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Funding Proposal</h1>
        <p className="text-muted-foreground mt-1">
          Submit a new funding proposal for a campaign milestone
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="py-0">
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const campaign = campaigns.find(
                      (campaign) => campaign.object_id === selectedCampaignId
                    );

                    if (campaign) {
                      form.setValue("campaignId", campaign.blob_id);
                      if (campaign.milestones) {
                        form.setValue(
                          "milestoneId",
                          (campaign.milestones.length + 1).toString() || "1"
                        );
                      }
                    }

                    form.handleSubmit(onSubmit)(e);
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="objectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="gap-0.5">
                            Campaign <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a campaign" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {campaigns.map((campaign, index) => (
                                <SelectItem
                                  key={index}
                                  value={campaign.object_id}
                                >
                                  {campaign.campaign_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the campaign for this proposal
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={form.control}
                      name="milestoneId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Milestone</FormLabel>
                          <Input
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={true}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a milestone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {milestones.map((milestone) => (
                                <SelectItem
                                  key={milestone.id}
                                  value={milestone.id}
                                >
                                  {milestone.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {!selectedCampaignId
                              ? "Select a campaign first"
                              : milestones.length === 0
                              ? "No eligible milestones for this campaign"
                              : "Select the milestone for this proposal"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="gap-0.5">
                          Proposal Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a clear title for your proposal"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Keep it concise and descriptive
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
                        <FormLabel className="gap-0.5">
                          Description <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your proposal in detail"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain why this proposal should be funded and how it
                          aligns with the campaign goals
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="requestedAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="gap-0.5">
                            Requested Amount (SUI)
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="1" step="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            The amount of SUI tokens requested for this
                            milestone
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="votingDurationDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="gap-0.5">
                            Voting Duration (Days)
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="30" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long the voting period should last (1-30 days)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="gap-0.5">
                          Deliverables <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List the specific deliverables for this milestone"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List each deliverable on a new line. Be specific and
                          measurable.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="gap-0.5">
                        Proposal Details
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentFields = form.getValues().details || [];
                          form.setValue("details", [
                            ...currentFields,
                            { title: "", content: "" },
                          ]);
                        }}
                      >
                        Add Section
                      </Button>
                    </div>
                    <FormDescription>
                      Tell your proposal details by adding sections
                    </FormDescription>

                    {(form.watch("details") || []).length > 0 ? (
                      <div className="space-y-4">
                        {(form.watch("details") || []).map((field, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <Input
                                placeholder="Section Title"
                                value={field.title}
                                onChange={(e) => {
                                  const currentFields = [
                                    ...(form.getValues().details || []),
                                  ];
                                  if (currentFields[index]) {
                                    currentFields[index].title = e.target.value;
                                    form.setValue("details", currentFields);
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
                                    form.getValues().details || [];
                                  const newFields = currentFields.filter(
                                    (_, i) => i !== index
                                  );
                                  form.setValue("details", newFields);
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
                                  ...(form.getValues().details || []),
                                ];
                                if (currentFields[index]) {
                                  currentFields[index].content = e.target.value;
                                  form.setValue("details", currentFields);
                                }
                              }}
                              rows={4}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">
                          Add sections to tell your story in an organized way
                        </p>
                      </div>
                    )}
                    {form.formState.errors.details && (
                      <p className="text-sm text-destructive mt-2">
                        {form.formState.errors.details.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!currentAccount || isLoading || load}
                    >
                      {!load ? "Create Proposal" : "Creating..."}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="py-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">
                Creating a Good Proposal
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Be Clear and Specific</h4>
                  <p className="text-sm text-muted-foreground">
                    Clearly describe what you plan to achieve with the requested
                    funds.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Set Measurable Deliverables</h4>
                  <p className="text-sm text-muted-foreground">
                    Define concrete outcomes that can be objectively verified.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Be Realistic</h4>
                  <p className="text-sm text-muted-foreground">
                    Request an amount that is justifiable for the work involved.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Explain the Value</h4>
                  <p className="text-sm text-muted-foreground">
                    Describe how this milestone advances the overall campaign
                    objectives.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
