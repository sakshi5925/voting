import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getContract } from "../../contracts/getContract";


const initialState = {
    myVote: null,
    votingInProgress: false,
    voteReceipt: null,
    error: null
}
const validateVoter= async (voterAddress) => {
    try {
        const contract = getContract();
        const voterData = await contract.getVoterInfo(voterAddress);
        if (!voterData.isRegistered) {
            return "User is not authorized to vote";
        }

        if (voterData.hasVoted) {
            return "User has already voted";
        }
        const electionStatus = await contract.getElectionStatus();


        if (electionStatus.status !== 1) {
            return "Election is not active";
        }
        return null;
    }
    catch (error) {
        return "Failed to validate voter";
    }
}


export const verifyVote = createAsyncThunk(
    'voting/verifyVote', async ({ candidateId }, { rejectWithValue }) => {
        try {
            const contract = getContract();
            const [hasVoted, votedCandidateId, name, party, timestamp] = await contract.getMyVote();
            const candidate = await contract.getCandidate(candidateId);
            if (!hasVoted || 
                votedCandidateId.toNumber() !== candidateId || 
                name !== candidate.name || 
                party !== candidate.party) {
                return rejectWithValue("Vote not recorded correctly");
            }
            return {
                hasVoted: true,
                candidateId: candidateId,
                name: candidate.name,
                party: candidate.party,
                timestamp: timestamp.toNumber()
            };
        } catch (error) {
             return rejectWithValue(error?.message || "Failed to verify vote");
        }
    }
)


export const castVote = createAsyncThunk(
    'voting/castVote', async ({ candidateId }, { rejectWithValue }) => {
        try {

            const contract = getContract();
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const userAddress = accounts[0];
            const validationError = await validateVoter(userAddress);
            if (validationError) {
                return rejectWithValue(validationError);
            }
             try {
                await contract.getCandidate(candidateId);
            } catch {
                return rejectWithValue("Invalid candidate selected");
            }
            const tx = await contract.vote(candidateId);
            const receipt = await tx.wait();
            const candidate = await contract.getCandidate(candidateId);
           return {
                hasVoted: true,
                candidateId: candidateId,
                candidateName: candidate.name,
                candidateParty: candidate.party,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                timestamp: Date.now()
            };
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to cast vote');
        }
    }
)

export const fetchMyVote = createAsyncThunk(
    'voting/fetchMyVote', async (_, { rejectWithValue }) => {
        try {
            const contract = getContract();
            const [hasVoted, candidateId, name, party, timestamp] = await contract.getMyVote();
            if (!hasVoted) {
                return null;
            }
           return {
                hasVoted,
                candidateId: candidateId.toNumber(),
                candidateName: name,
                candidateParty: party,
                timestamp: timestamp.toNumber()
            };
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to fetch vote');
        }
    }
)

export const votingSlice = createSlice({
    name: "voting",
    initialState,
    reducers: {
        setMyVote: (state, action) => {
            state.myVote = action.payload;
        },
        setVotingProgress: (state, action) => {
            state.votingInProgress = action.payload;
        },
        setVoteReceipt: (state, action) => {
            state.voteReceipt = action.payload;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(castVote.pending, (state) => {
                state.votingInProgress = true;
                state.error = null;
            })
            .addCase(castVote.fulfilled, (state, action) => {
                state.votingInProgress = false;
                state.myVote = action.payload;
                state.voteReceipt = {
                    transactionHash: action.payload.transactionHash,
                    candidateId: action.payload.candidateId,
                    candidateName: action.payload.candidateName,
                    candidateParty: action.payload.candidateParty,
                    blockNumber: action.payload.blockNumber,
                    timestamp: action.payload.timestamp
                };
            })
            .addCase(castVote.rejected, (state, action) => {
                state.votingInProgress = false;
                state.error = action.payload;
            })
            .addCase(fetchMyVote.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchMyVote.fulfilled, (state, action) => {
                state.myVote = action.payload;
            })
            .addCase(fetchMyVote.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(verifyVote.pending, (state) => {
                state.error = null;
            })
            .addCase(verifyVote.fulfilled, (state, action) => {
                state.myVote = action.payload;
            })
            .addCase(verifyVote.rejected, (state, action) => {
                state.error = action.payload;
            })

    }
})
export const { setMyVote, setVotingProgress, setVoteReceipt}=votingSlice.actions;
export default votingSlice.reducer;