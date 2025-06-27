import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getContract } from "../../contracts/getContract";
const initialState = {
    results: [],
    winner: null,
    totalVotes: 0,
    isLoading: false,
    error: null
}
export const fetchResults = createAsyncThunk(
    'result/fetchResults', async (_, { rejectWithValue }) => {
        try {
            const contract = getContract();
            const result = await contract.getResults();
            return result;
        } catch (error) {
            return rejectWithValue(error.message || "failed to load the result");
        }
    }
)
export const fetchWinner = createAsyncThunk(
    'result/fetchWinner', async (_, { rejectWithValue }) => {
        try {
            const contract = await getContract();
            const winner = await contract.getWinner();
            return winner;
        } catch (error) {
            return rejectWithValue(error.message || "failed to load the winner");
        }
    }
)
export const fetchLiveResults = createAsyncThunk(
    'result/fetchLiveResults', async (_, { rejectWithValue }) => {
        try {
            const contract = await getContract();
            const results = await contract.getElectionStatus();
            return results.totalVotes;
        } catch (error) {
            return rejectWithValue(error.message);
        }

    }
)


export const resultsSlice = createSlice({
    name: "result",
    initialState,
    reducers: {
        setResults: (state, action) => {
            state.results = action.payload;
        },
        setWinner: (state, action) => {
            state.winner = action.payload;
        },
        updateVoteCounts: (state, action) => {
            state.totalVotes = action.payload;
            state.results.totalVotes = action.payload;
        }
    },
    extraReducers: (bulider) => {
        bulider
            .addCase(fetchResults.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchResults.fulfilled, (state, action) => {
                state.isLoading = false;
                state.results = action.payload;
            })
            .addCase(fetchResults.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchWinner.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWinner.fulfilled, (state, action) => {
                state.isLoading = false;
                state.winner = action.payload;
            })
            .addCase(fetchWinner.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchLiveResults.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchLiveResults.fulfilled, (state, action) => {
                state.isLoading = false;
                state.totalVotes = action.payload;
            })
            .addCase(fetchLiveResults.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
    }

})
export const { setResults, setWinner, updateVoteCounts } = resultsSlice.actions;
export default resultsSlice.reducer;