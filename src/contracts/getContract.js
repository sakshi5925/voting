import { ethers } from "ethers";
import abis from "./VotingSystem.json";
import { CONTRACT_ADDRESS } from './config';
import { getProvider as getStoredProvider, setProvider, getSigner as getStoredSigner, setSigner } from "./web3Store";


export const getProvider = () => {

  let provider=getStoredProvider();
  if (provider) return provider;
  if (!window.ethereum) {
    console.log("metamask not installed");
    provider = ethers.getDefaultProvider();
    return provider;
  } else {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  setProvider(provider);
  return provider;
};

export const getSigner = async () => {
  let signer = getStoredSigner();
  if (signer) return signer;
  const provider = getProvider();
  signer = await provider.getSigner();
  setSigner(signer);
  return signer;
};

export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, abis, signer);
};

export const getReadOnlyContract = () => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, abis, provider);
};
