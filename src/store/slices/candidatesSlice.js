import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getContract } from "../../contracts/getContract";


const initialState = {
    candidates: [],
    candidateIds: [],
    isLoading: false,
    error: null
}
const validateCandidateData = (candidateData) => {
    if (!candidateData.name || candidateData.name.trim().length === 0) {
        return "Candidate name is required";
    }
    if (!candidateData.party || candidateData.party.trim().length === 0) {
        return "Party name is required";
    }
    if (!candidateData.description || candidateData.description.trim().length === 0) {
        return "Description is required";
    }
    if (candidateData.name.trim().length < 2) {
        return "Candidate name must be at least 2 characters long";
    }
    if (candidateData.party.trim().length < 2) {
        return "Party name must be at least 2 characters long";
    }
    if (candidateData.description.trim().length < 10) {
        return "Description must be at least 10 characters long";
    }
    return null;
}

export const fetchCandidates = createAsyncThunk(
    'candidates/fetchCandidates', async (_, { rejectWithValue }) => {
        try {
            const contract = await getContract();
            const candidateIds = await contract.getAllCandidateIds();
            const candidatesPromise = candidateIds.map(async (id) => {
                const candidate = await contract.getCandidate(Number(id));
                return {
                    id: Number(candidate.id),
                    name: candidate.name,
                    party: candidate.party,
                    description: candidate.description,
                    votes: Number(candidate.voteCount)
                };
            });
            const candidates = await Promise.all(candidatesPromise);
            const ids = candidates.map(c => c.id);
            return { candidates, candidateIds: ids };

        } catch (error) {
            console.error("Error fetching candidates:", error);
            return rejectWithValue(error.message || "Failed to fetch candidates");

        }
    }
)

export const registerCandidate = createAsyncThunk(
    'registerCandidate/candidate', async ({ candidateData }, { rejectWithValue, getState }) => {
        try {
            const validationerror = validateCandidateData(candidateData);
            if (validationerror) {
                return rejectWithValue(validationerror);
            }

            const { candidates } = getState().candidates;
            const isalreadypresent = candidates.some(
                (c) => c.name.toLowerCase() === candidateData.name.toLowerCase() &&
                    (c).party.toLowerCase() === candidateData.party.toLowerCase()
            );
            if (isalreadypresent) {
                return rejectWithValue("Candidate with this name and party already exists");
            }
            const contract = await getContract();
            const transaction = await contract.registerCandidate(
                candidateData.name,
                candidateData.party,
                candidateData.description
            );
            const receipt = await transaction.wait();
            const event = receipt.events?.find((e) => e.event === 'CandidateRegistered');
            const candidateId = event?.args?.candidateId?.toNumber();
            if (!candidateId) {
                throw new Error("Failed to get candidate ID from transaction");
            }

            return {
                id: candidateId,
                name: candidateData.name.trim(),
                party: candidateData.party.trim(),
                description: candidateData.description.trim(),
                votes: 0
            };
        } catch (error) {
            console.error("Error registering candidate:", error);
            return rejectWithValue(error.message || "Failed to register candidate");
        }
    }
)

export const fetchCandidateDetails = createAsyncThunk(
    'fetchCandidateDetails/candidates', async ({ candidateId }, { rejectWithValue }) => {
        try {
            if (!candidateId || candidateId <= 0) {
                return rejectWithValue("Invalid candidate ID");
            }
            const contract = await getContract();
            const candidate = await contract.getCandidate(candidateId);
            return {
                id:  Number(candidate.id),
                name: candidate.name,
                party: candidate.party,
                description: candidate.description,
                votes: Number(candidate.voteCount)
            }

        } catch (error) {
            console.error("Error fetching candidate details:", error);
            return rejectWithValue(error.message || "Failed to fetch candidate details");

        }
    }
)
export const candidatesSlice = createSlice({
    name: "candidates",
    initialState,
    reducers: {
        setCandidates: (state, action) => {
            state.candidates = action.payload;
            state.candidateIds = action.payload.map((c) => c.id.toString());
        },
        addCandidate: (state, action) => {
            state.candidates.push(action.payload);
            state.candidateIds.push(action.payload.id.toString());
        },
        updateCandidateVotes: (state, action) => {
            const index = state.candidates.findIndex(
                (c) => c.id.toString() === action.payload.id.toString()
            );
            if (index !== -1) {
                state.candidates[index].voteCount = action.payload.voteCount;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCandidates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCandidates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.candidates = action.payload.candidates;
                state.candidateIds = action.payload.candidateIds;
            })
            .addCase(fetchCandidates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;

            })
            .addCase(registerCandidate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerCandidate.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.candidates.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.candidates[index] = action.payload;
                } else {
                    state.candidates.push(action.payload);
                    state.candidateIds.push(action.payload.id);
                }
                state.candidateIds = [...new Set(state.candidateIds)];
            })
            .addCase(registerCandidate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchCandidateDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCandidateDetails.fulfilled, (state, action) => {
                const index = state.candidates.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.candidates[index] = action.payload;
                }
                else {
                    state.candidates.push(action.payload);
                    state.candidateIds.push(action.payload.id);
                }
                state.isLoading = false;
            })
            .addCase(fetchCandidateDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });


    }
})

export const { setCandidates, addCandidate, updateCandidateVotes } = candidatesSlice.actions;
export const candidatesReducer = candidatesSlice.reducer;