import { Transaction } from "@mysten/sui/transactions";

const MODULE_ADDRESS =
  "0xaf80ca657630b8c26060cb827c547525722b76e567779f16f7fee69979c37f47";
const MODULE_NAME = "fundx";

// Helper function to get the full module ID
const getModuleId = () => `${MODULE_ADDRESS}::${MODULE_NAME}`;

// --- Functions to call the contract ---
export const approve_milestone = () => {
  const txb = new Transaction();
  txb.moveCall({
    target: `${getModuleId()}::approve_milestone`,
    arguments: [txb.object("")],
  });

  return txb;
};

export const contribute = () => {
  const txb = new Transaction();

  txb.moveCall({
    target: `${getModuleId()}::contribute`,
    arguments: [],
  });

  return txb;
};

export const create_campaign = () => {
  const txb = new Transaction();

  txb.moveCall({
    target: `${getModuleId()}::create_campaign`,
    arguments: [],
  });

  return txb;
};

export const refund = () => {
  const txb = new Transaction();

  txb.moveCall({
    target: `${getModuleId()}::refund`,
    arguments: [],
  });

  return txb;
};

export const release_funds = () => {
  const txb = new Transaction();

  txb.moveCall({
    target: `${getModuleId()}::release_funds`,
    arguments: [],
  });

  return txb;
};
