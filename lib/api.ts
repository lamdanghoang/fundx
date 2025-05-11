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
  galleryImages: Array<string>;
  targetAmount: number;
  duration: number;
  rewardType: "none" | "token" | "nft";
}

interface Campaign extends CampaignFormData {
  blobId: string;
  createdAt: string;
  updatedAt: string;
}

export const storeImageFile = async (
  url: string,
  file: File
): Promise<string> => {
  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    mode: "cors",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with ${response.status}`
    );
  }

  const data = await response.json();
  console.log("Blob stored:", data);

  // Handle different result variants
  if (data.newlyCreated) {
    // If the blob was just created
    return data.newlyCreated.blobObject.blobId;
  } else if (data.alreadyCertified) {
    // If the blob already exists and is certified
    return data.alreadyCertified.blobId;
  } else if (data.markedInvalid) {
    throw new Error("Blob was marked invalid");
  }
  throw new Error(data.error.error_msg);
};

export const storeFormData = async (
  values: CampaignFormData
): Promise<string> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PUBLISHER}/v1/blobs?epochs=45`,
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

  // Handle different result variants
  if (result.newlyCreated) {
    // If the blob was just created
    return result.newlyCreated.blobObject.blobId;
  } else if (result.alreadyCertified) {
    // If the blob already exists and is certified
    return result.alreadyCertified.blobId;
  } else if (result.markedInvalid) {
    throw new Error("Blob was marked invalid");
  }
  throw new Error(result.error.error_msg);
};

export const readBlob = async (blobId: string) => {
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

export const uploadImage = async (values: {
  campaignId: string;
  imgId: string;
  type: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/upload-image`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const createCampaign = async (
  values: CampaignFormData & { blobId: string } & { objectId?: string } & {
    txHash: string;
  }
): Promise<Campaign> => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/create-campaign`;
  try {
    const response = await fetch(url, {
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

export const getCampaigns = async (limit: number, offset: number) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/campaigns?limit=${limit}&offset=${offset}`;
  try {
    const response = await fetch(url);

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

export const getVotingCampains = async (limit: number, offset: number) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/voting-campaigns?limit=${limit}&offset=${offset}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch voting campaigns");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching voting campaigns:", error);
    throw error;
  }
};

export const getCampaignById = async (id: string) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/campaign?id=${id}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch campaign with id");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaign with id:", error);
    throw error;
  }
};

export const getContributionByAddress = async (address: string) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/contributions?address=${address}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch contribution with address");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contribution with address: ", error);
    throw error;
  }
};

export const getMilestonesCampaignById = async (id: string) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/milestones?id=${id}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch milestones of campaign");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching milestones of  campaign:", error);
    throw error;
  }
};

interface ContributionReq {
  campaignId: string;
  walletAddress: string;
  amount: number;
  tierType: string;
  currency: string;
}

export const createContribute = async (
  values: ContributionReq & { txHash: string }
) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/create-contribution`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error("Failed to create contribution");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating contribution:", error);
    throw error;
  }
};

export const updateVotes = async (
  objectId: string,
  milestoneId: string,
  values: {
    voteResult: number;
  }
) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/campaigns/${objectId}/milestones/${milestoneId}/vote-result`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error("Failed to update vote result");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating vote result: ", error);
    throw error;
  }
};

export const updateClaimed = async (objectId: string, milestoneId: string) => {
  const url = `${process.env.NEXT_PUBLIC_FUNDX_API}/campaigns/${objectId}/milestones/${milestoneId}/claimed`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to update is_claimed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating is_claimed: ", error);
    throw error;
  }
};
