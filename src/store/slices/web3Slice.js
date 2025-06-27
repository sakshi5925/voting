import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getProvider } from '../../contracts/getContract'
import { setProvider, setSigner } from '../../contracts/web3Store'
import { CHAIN_ID } from '../../contracts/config'
import { clearWeb3Store } from '../../contracts/web3Store'
const initialState = {
    account: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null
}

export const connectWallet = createAsyncThunk(
    'wallet/connectWallet',
    async (_, { rejectWithValue }) => {
        try {
            const provider = getProvider()
            await provider.send('eth_requestAccounts', [])
            const signer = await provider.getSigner()
            const account = await signer.getAddress()
            const network = await provider.getNetwork()
            if (String(network.chainId) !== CHAIN_ID) {
                return rejectWithValue(
                    `Wrong Network! Please connect to Sepolia Testnet (Chain ID: ${CHAIN_ID})`
                );
            }
            setProvider(provider)
            setSigner(signer)
            return { account, chainId: Number(network.chainId) }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)
export const checkConnection = createAsyncThunk(
    'wallet/checkConnection',
    async (_, { rejectWithValue }) => {
        try {
            const provider = getProvider();
            const accounts = await provider.listAccounts();
            const network = await provider.getNetwork();
            if (accounts.length === 0) {
                return rejectWithValue("No wallet connected.");
            }
            const signer = await provider.getSigner();
            setProvider(provider)
            setSigner(signer)

            return {
                account: accounts[0],
                chainId: Number(network.chainId)
            }
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
            clearWeb3Store();
            state.account = null
            state.chainId = null
            state.isConnected = false
        },
        switchNetwork: (state, action) => {
            state.chainId = action.payload;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(connectWallet.pending, (state) => {
                state.isConnecting = true
            })
            .addCase(connectWallet.fulfilled, (state, action) => {
                state.account = action.payload.account
                state.chainId = action.payload.chainId
                state.isConnected = true
                state.isConnecting = false
            })
            .addCase(connectWallet.rejected, (state) => {
                state.isConnecting = false;
                state.error = action.payload;
            })
            .addCase(checkConnection.pending, (state) => {
                state.isConnecting = true
            })
            .addCase(checkConnection.fulfilled, (state, action) => {
                state.account = action.payload.account
                state.chainId = action.payload.chainId
                state.isConnected = true
                state.isConnecting = false
            })
            .addCase(checkConnection.rejected, (state, action) => {
                state.isConnecting = false
                state.error = action.payload
            })
    }
})
export const { disconnectWallet, switchNetwork } = web3Slice.actions
export default web3Slice.reducer