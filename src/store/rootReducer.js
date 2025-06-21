import { combineReducers } from "@reduxjs/toolkit";
import { web3Slice } from "./slices/web3Slice";
import { authSlice } from "./slices/authSlice.";
import { electionSlice } from "./slices/electionSlice";


const  rootReducer=combineReducers({
    web3:web3Slice,
    auth:authSlice,
    election:electionSlice
})

export default rootReducer;