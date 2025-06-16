import { ethers } from "hardhat";
import abis from "./VotingSystem.json";
import { CONTRACT_ADDRESS } from './config';


export const getProvider=()=>{
    let Provider;
    if(!window.ethereum){
        console.log("metamask not installed")
        Provider=ethers.getDefaultProvider();
        return Provider;
    }
    else{
        Provider=new ethers.BrowserProvider(window.ethereum);
    }
   
    return Provider;
}



export const  getSigner=async()=>{
     const provider=getProvider();
     const signer=await provider.getSigner();
     return signer;
}



export const getContract=async ()=>{
    const signer=await getSigner();
    return new  ethers.Contract(CONTRACT_ADDRESS,abis,signer);
}
export const getReadOnlyContract=()=>{
    const provider=getProvider();
    return  new  ethers.Contract(CONTRACT_ADDRESS,abis,provider);
}