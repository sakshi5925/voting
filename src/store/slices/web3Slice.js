import {  createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getProvider } from '../../contracts/getContract'
const chainId= process.env.REACT_APP_CHAIN_ID;
const initialState = {
  provider: null,
  signer: null,
  account: null,    
  chainId: null,      
  isConnected: false, 
  isConnecting: false,
  error: null
}
export const connectWallet=createAsyncThunk(
    'wallet/connectWallet',
    async(_,{rejectWithValue })=>{
        try {
            const provider=getProvider()
            await provider.send('eth_requestAccounts',[])
            const signer=await provider.getSigner()
            const account = await signer.getAddress()
            const network = await provider.getNetwork()
            if(String(network.chainId)!==chainId){
                return rejectWithValue(
          `Wrong Network! Please connect to Sepolia Testnet (Chain ID: ${chainId})`
        );
            }
            return { provider, signer, account, chainId: Number(network.chainId) }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)
export const checkConnection=createAsyncThunk(
     'wallet/checkConnection',
     async(_,{rejectWithValue})=>{
        try {
            const provider=getProvider();
            const accounts = await provider.listAccounts();
            const network = await provider.getNetwork();
            if (accounts.length === 0) {
            return rejectWithValue("No wallet connected.");
      }
      return {
        provider,
        signer: await provider.getSigner(),
        account: accounts[0],
        chainId: Number(network.chainId)
      };
        } catch (error) {
             return rejectWithValue(error.message);
        }
     }
)

export const web3Slice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        disconnectWallet: (state) => {
            state.provider = null,
            state.signer = null
            state.account = null
            state.chainId = null
            state.isConnected = false
        },
        switchNetwork:(state,action)=>{
            state.chainId=action.payload;
        }

    },
    extraReducers:(builder)=>{
        builder
        .addCase(connectWallet.pending,(state)=>{
            state.isConnecting=true
        })
        .addCase(connectWallet.fulfilled,(state,action)=>{
            state.provider=action.payload.provider
            state.signer=action.payload.signer
            state.account=action.payload.account
            state.chainId=action.payload.chainId
            state.isConnected=true
            state.isConnecting=false
        })
        .addCase(connectWallet.rejected,(state)=>{
            state.isConnecting=false;
            state.error=action.payload;
        })
    }
})