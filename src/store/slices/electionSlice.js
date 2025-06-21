import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getContract } from "../../contracts/getContract";
const initialState={
    electionState:null,
    totalCandidates:0,
    totalVotes:0,
    totalVoters:0,
    isLoading:false,
    error:null
}
export const  fetchElectionStatus=createAsyncThunk(
    'election/ fetchElectionStatus',
    async(_,{rejectWithValue})=>{
        try {
            const contract=getContract()
            const {status,totalCandidates,totalVotes_,totalVoters}=await contract.getElectionStatus()
            return {status,totalCandidates,totalVotes_,totalVoters}
        } catch (error) {
              return rejectWithValue(error.message)
        }
    }
)

export const  startElection =createAsyncThunk(
  'election/startElection',
  async(_,{rejectWithValue})=>{
    try {
      const contract=getContract();
      const start=await contract.startElection();
      await start.wait();
      return{
        electionState:'Active'
      }
    } catch (error) {
          return rejectWithValue(error.message)
    }
  }

)

export const  endElection =createAsyncThunk(
  'election/endElection',
  async(_,{rejectWithValue})=>{
    try {
      const contract=getContract();
      const endE=await contract.endElection();
      await endE.wait();
      return{
        electionState:'Ended'
      }
    } catch (error) {
          return rejectWithValue(error.message)
    }
  }

)

export const electionSlice=createSlice({
    name:"election",
    initialState,
    reducers:{
        setElectionState:(state,action)=>{
            state.electionState=action.payload
        },
        updateElectionStats:(state,action)=>{
            state.electionState=action.payload.electionState
            state.totalCandidates=action.payload.totalCandidates
            state.totalVotes=action.payload.totalVotes
            state.totalVoters=action.payload.totalVoters
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(fetchElectionStatus.pending,(state)=>{
            state.isLoading=true
        })
        .addCase(fetchElectionStatus.fulfilled,(state,action)=>{
            state.electionState=action.payload.status
            state.totalCandidates=action.payload.totalCandidates
            state.totalVotes=action.payload.totalVotes_
            state.totalVoters=action.payload.totalVoters
            state.isLoading=false
        })
        .addCase(fetchElectionStatus.rejected,(state,action)=>{   state.isLoading=false
            state.error=action.payload
        })
        .addCase(startElection.fulfilled,(state,action)=>{
            state.electionState=action.payload.electionState
        })
        .addCase(endElection.fulfilled,(state,action)=>{
            state.electionState=action.payload.electionState
        })
    }
})
export const {setElectionState,updateElectionStats}=electionSlice.actions
export default electionSlice.reducer