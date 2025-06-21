import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getContract } from "../../contracts/getContract";

const initialState={
    isOwner:false,
    isRegisteredVoter:false,
    hasVoted:false,
    userRole:null,
    isLoading:false,
    error: null
}

export const checkUserRole =createAsyncThunk(
    'auth/checkUserRole',
    async({account},{rejectWithValue})=>{
        try {
            const contract=getContract()
            const owner=await contract.owner()
            const isOwner=owner.toLowerCase()===account.toLowerCase()
            return {isOwner}
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
) 

export const checkVotingStatus=createAsyncThunk(
    'auth/checkVotingStatus',
    async({account},{rejectWithValue})=>{
        try {
            const contract=getContract()
            const voter=await contract.voters(account)
            return{
                isRegisteredVoter:voter.isRegistered,
                hasVoted:voter.hasVoted
            }
        } catch (error) {
             return rejectWithValue(error.message)
        }
    }
)





export const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        setUserRole:(state,action)=>{
            state.userRole=action.payload
         },
        setOwnerStatus:(state,action)=>{
            state.isOwner=action.payload
         },
        setVoterStatus:(state,action)=>{
            state.isRegisteredVoter=action.payload.isRegisteredVoter,
            state.hasVoted=action.payload.hasVoted
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(checkUserRole.pending,(state)=>{
            state.isLoading=true
        })
        .addCase(checkUserRole.fulfilled,(state,action)=>{
            state.isOwner=action.payload.isOwner
            state.isLoading=false
        })
        .addCase(checkUserRole.rejected,(state,action)=>{
            state.isLoading=false
            state.error=action.payload
        })
        .addCase(checkVotingStatus.pending,(state)=>{
            state.isLoading=true
        })
        .addCase(checkVotingStatus.fulfilled,(state,action)=>{
            state.isRegisteredVoter=action.payload.isRegisteredVoter
            state.hasVoted=action.payload.hasVoted
            state.isLoading=false
        })
        .addCase(checkVotingStatus.rejected,(state,action)=>{
            state.error=action.payload
        })
    }
})
export const {setUserRole,setOwnerStatus,setVoterStatus}=authSlice.actions
export  default authSlice.reducer