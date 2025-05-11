import { useSuiClientQuery } from "@mysten/dapp-kit";

export default function OwnedObjects({ address }: { address: string }) {
  const { data } = useSuiClientQuery("getOwnedObjects", {
    owner: address,
    filter: {
      StructType:
        "0xbbfac22b0569bf81ba7280954092a04dce282e96cc9bc6f285f168514c49a902::fundx_nft::FundXContributionNFT",
    },
    options: {
      showType: true,
      showContent: true,
    },
  });
  if (!data) {
    return null;
  }

  return (
    <ul>
      {data.data.map((object) => (
        <li key={object.data?.objectId}>
          <a
            href={`https://example-explorer.com/object/${object.data?.objectId}`}
          >
            {object.data?.objectId}
          </a>
          Type: {object.data?.type}
        </li>
      ))}
    </ul>
  );
}
