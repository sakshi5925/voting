import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { connectWallet, disconnectWallet } from './store/slices/web3Slice'
import { checkUserRole,checkVotingStatus } from './store/slices/authSlice';
import { registerCandidate ,fetchCandidates,fetchCandidateDetails } from './store/slices/candidatesSlice';
import { endElection, fetchElectionStatus, startElection } from './store/slices/electionSlice';
function App() {
  const dispatch = useDispatch();
  const { account, isConnected, chainId, isConnecting } = useSelector((state) => state.wallet);
  const {isOwner,isRegisteredVoter,hasVoted,userRole}=useSelector((state)=>state.auth);
  const {candidates,candidateIds}=useSelector((state)=>state.candidates);
  const {electionState,totalCandidates,totalVotes,isLoading,error}=useSelector((state)=>state.election);
  const candidatedata={
  name:"riya",
  party:"hello",
  description:"lets do change"
}
  const handleConnect = () => dispatch(connectWallet())
  const handleDisconnect = () => dispatch(disconnectWallet())
  const handleUserRole = () => dispatch(checkUserRole({ account }))
  const handleVotingStatus = () => dispatch(checkVotingStatus({ account }))
  const handleregistration = () => dispatch(registerCandidate({ candidateData: candidatedata }))
  const handlefetchcandidates = () => dispatch(fetchCandidates())
  const handlefetchcandidatedetail = () => dispatch(fetchCandidateDetails({ candidateId: 2 }));
  const handlefetchelectionstatus=()=>dispatch()

  return (
    <>
      <div>
        {isConnecting ? (
          <p>Connecting...</p>
        ) : isConnected ? (
          <>
            <p>Connected account: {account}</p>
            <p>Chain ID: {chainId}</p>
            <button onClick={handleDisconnect}>Disconnect</button>
          </>
        ) : (
          <button onClick={handleConnect}>Connect to the account</button>
        )}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
      {isConnected && (
        <div>
          <button onClick={handleUserRole}>Check if Account is Owner</button>
          <button onClick={handleVotingStatus}>Check Voting Status</button>
            {isLoading && <p>Loading role/status...</p>}
           <div>
            <p>Is Owner:{isOwner?'yes':'No'}</p>
            <p>is registerd voter :{isRegisteredVoter?'yes':'no'}</p>
            <p>has voted:{hasVoted?'yes':'no'}</p>
           </div>
        </div>
      )}
        <div>
            <button onClick={handleregistration}>Register as Candidate</button>
            <button onClick={handlefetchcandidates}>See All Candidates</button>
            <button onClick={handlefetchcandidatedetail}>Fetch Candidate Details</button>
       </div>
       <div>
        {candidates.length>0?(
          candidates.map((candidate,index)=>(
            <div key={index} className="border p-2 mt-2">
                  <p>Name: {candidate.name}</p>
                  <p>Party: {candidate.party}</p>
                  <p>Description: {candidate.description}</p>
                  <p>Votes:{candidate.votes}</p>
                </div>
          ))
        ):(<p>No candidates found</p>)}
       </div>
    </>
  )
}

export default App
