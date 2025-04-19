interface CampaignFormData {
  title: string;
  category: string;
  description: string;
  storyFields?: Array<{
    title: string;
    content: string;
  }>;
  roadmapPhases?: Array<{
    title: string;
    timeline: string;
    description: string;
  }>;
  teams?: Array<{
    name: string;
    role: string;
    contact: {
      email?: string;
      twitter?: string;
      telegram?: string;
    };
  }>;
  targetAmount: number;
  duration: number;
  rewardType: "none" | "token" | "nft";
}

interface Campaign extends CampaignFormData {
  id: string;
  blobId: string;
  createdAt: string;
  updatedAt: string;
}

interface BlobResponse {
  id: string;
  data: CampaignFormData;
  createdAt: string;
}

export const storeBlob = async (
  values: CampaignFormData
): Promise<BlobResponse> => {
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
    return result;
  } catch (error) {
    console.error("Error storing blob:", error);
    throw error;
  }
};

export const readBlob = async (blobId: string): Promise<BlobResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AGGREGATOR}/v1/blobs/${blobId}`
    );
    const blob = await response.json();
    console.log("Blob content:", blob);
    return blob;
  } catch (error) {
    console.error("Error reading blob:", error);
    throw error;
  }
};

export const createCampaign = async (
  values: CampaignFormData & { blobId: string }
): Promise<Campaign> => {
  try {
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error("Failed to create campaign");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await fetch("/api/campaigns");

    if (!response.ok) {
      throw new Error("Failed to fetch campaigns");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const getCampaignById = async (id: string): Promise<Campaign> => {
  try {
    const response = await fetch(`/api/campaigns/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch campaign");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaign:", error);
    throw error;
  }
};
