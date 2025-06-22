import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getContract } from "../../contracts/getContract";


const initialState = {
    voters: [],
    authorizedVoters: [],
    isLoading: false,
    error: null
};



export const fetchVoters = createAsyncThunk(
    'voters/fetchVoters',
    async (_, { rejectWithValue }) => {
        try {
            const contract = getContract();
            const voterAddresses = await contract.getAllVoters();
            const votersPromise = voterAddresses.map(async (address) => {
                const voter = await contract.getVoterInfo(address);
                return {
                    address: address,
                    isRegistered: voter.isRegistered,
                    hasVoted: voter.hasVoted,
                    votedCandidateId: voter.votedCandidateId.toNumber(),
                    timestamp: voter.timestamp.toNumber(),
                };
            });
            const voters = await Promise.all(votersPromise);
            return voters;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch voters");
        }
    }
);


export const authorizeVoter = createAsyncThunk(
    'voters/authorizeVoter',
    async (voterAddress, { rejectWithValue }) => {
        try {
            const contract = getContract();
            const existingVoter = await contract.getVoterInfo(voterAddress);
            if (existingVoter.isRegistered) {
                return rejectWithValue("Voter is already authorized");
            }
            const tx = await contract.authorizeVoter(voterAddress);
            await tx.wait();
            const voterInfo = await contract.getVoterInfo(voterAddress);
            return {
                address: voterAddress,
                isRegistered: voterInfo.isRegistered,
                hasVoted: voterInfo.hasVoted,
                votedCandidateId: voterInfo.votedCandidateId.toNumber(),
                timestamp: voterInfo.timestamp.toNumber(),
            };
        } catch (error) {
            console.error("Error authorizing voter:", error);
            return rejectWithValue(error.message || "Failed to authorize voter");
        }
    }
);


export const batchAuthorizeVoters = createAsyncThunk(
    'voters/batchAuthorizeVoters',
    async (voterAddresses, { rejectWithValue }) => {
        try {
            const contract = getContract();
            const results = [];

            for (const address of voterAddresses) {
                const voterInfo = await contract.getVoterInfo(address);
                if (!voterInfo.isRegistered) {
                    const tx = await contract.authorizeVoter(address);
                    await tx.wait();
                    const updatedVoter = await contract.getVoterInfo(address);
                    results.push({
                        address,
                        isRegistered: updatedVoter.isRegistered,
                        hasVoted: updatedVoter.hasVoted,
                        votedCandidateId: updatedVoter.votedCandidateId.toNumber(),
                        timestamp: updatedVoter.timestamp.toNumber(),
                    });
                }
            }

            return results;
        } catch (error) {
            console.error("Batch authorize error:", error);
            return rejectWithValue(error.message || "Batch authorization failed");
        }
    }
);

export const votersSlice = createSlice({
    name: "voters",
    initialState,
    reducers: {
        setVoters: (state, action) => {
            state.voters = action.payload;
            state.authorizedVoters = action.payload.filter((v) => v.isRegistered);
        },
        addVoter: (state, action) => {
            const exists = state.voters.some(
                (v) => v.address.toLowerCase() === action.payload.address.toLowerCase()
            );
            if (!exists) {
                state.voters.push(action.payload);
                if (action.payload.isRegistered) {
                    state.authorizedVoters.push(action.payload);
                }
            }

        },
        updateVoterStatus: (state, action) => {
            const index = state.voters.findIndex(
                (v) => v.address.toLowerCase() === action.payload.address.toLowerCase()
            );
            if (index !== -1) {
                state.voters[index] = {
                    ...state.voters[index],
                    ...action.payload,
                };
            }
            state.authorizedVoters = state.voters.filter((v) => v.isRegistered);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVoters.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVoters.fulfilled, (state, action) => {
                state.isLoading = false;
                state.voters = action.payload;
                state.authorizedVoters = action.payload.filter((v) => v.isRegistered);
            })
            .addCase(fetchVoters.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(authorizeVoter.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(authorizeVoter.fulfilled, (state, action) => {
                state.isLoading = false;
                state.voters.push(action.payload);
                if (action.payload.isRegistered) {
                    state.authorizedVoters.push(action.payload);
                }
            })
            .addCase(authorizeVoter.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(batchAuthorizeVoters.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(batchAuthorizeVoters.fulfilled, (state, action) => {
                state.isLoading = false;
                action.payload.forEach((voter) => {
                    if (voter.isRegistered) {
                        const index = state.voters.findIndex(
                            (v) => v.address.toLowerCase() === voter.address.toLowerCase()
                        );
                        if (index !== -1) {
                            state.voters[index] = {
                                ...state.voters[index],
                                ...voter,
                            };
                        } else {
                            state.voters.push(voter);
                        }
                    }
                });
                state.authorizedVoters = state.voters.filter((v) => v.isRegistered);
            })
            .addCase(batchAuthorizeVoters.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setVoters, addVoter, updateVoterStatus } = votersSlice.actions;

export default votersSlice.reducer;
