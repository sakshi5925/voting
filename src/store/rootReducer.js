import { combineReducers } from "@reduxjs/toolkit";
import  {web3Slice} from "./slices/web3Slice";
import {authSlice}  from "./slices/authSlice";
import  {electionSlice}  from "./slices/electionSlice";
import { votersSlice } from "./slices/votersSlice";
import { candidatesSlice } from "./slices/candidatesSlice";
import { votingSlice } from "./slices/votingSlice";
import { resultsSlice } from "./slices/resultsSlice";

const  rootReducer=combineReducers({
    wallet:web3Slice.reducer,
    auth:authSlice.reducer,
    election:electionSlice.reducer,
    voters:votersSlice.reducer,
    voting:votersSlice.reducer,
    candidates:candidatesSlice.reducer,
    result:resultsSlice.reducer
})

export default rootReducer;