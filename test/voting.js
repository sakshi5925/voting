const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
describe("VotingSystem", () => {
    let voting, user0, user2, transactionResponse, transactionReceipt, voterAddress;;
    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        user0 = accounts[1];
        user2 = accounts[2];
        voterAddress = await user2.getAddress();

        const Voting = await ethers.getContractFactory("VotingSystem");
        voting = await Voting.connect(user0).deploy();
    })
    describe("Deployed", () => {
        it("the contract is deployed  successfully", async () => {
            expect(await voting.address).to.not.equal(0);
        })
    });
    describe("Add candidate", () => {
        beforeEach(async () => {
            await voting.connect(user0).registerCandidate("sakshi", "Bacha party", "masti karo bhai");
        });

        it("should emit CandidateRegistered event", async () => {
            await expect(
                voting.connect(user0).registerCandidate("sakshi", "Bacha party", "masti karo bhai")
            )
                .to.emit(voting, "CandidateRegistered")
                .withArgs(2, "sakshi", "Bacha party", "masti karo bhai");
        });

        it("Get candidate function working properly or not", async () => {
            const [id, name, party, description, voteCount] = await voting.getCandidate(1);
            console.log("all", name, party, description, voteCount);
            expect(await voting.getAllCandidateIds()).to.not.null;
            expect(id).to.equal(1);
            expect(name).to.equal("sakshi");
            expect(party).to.equal("Bacha party");
            expect(description).to.equal("masti karo bhai");
            expect(voteCount).to.equal(0);

        });

    });
    describe("Autherise voter", async () => {
        it("should emit VoterAuthorised event", async () => {
            await expect(
                voting.connect(user0).authorizeVoter(voterAddress)
            )
                .to.emit(voting, "VoterAuthorized")
                .withArgs(voterAddress);
        });
        it("get voter info correctly or not ", async () => {
            await voting.connect(user0).authorizeVoter(voterAddress);
            const [isRegistered, hasVoted, votedCandidateId, timestamp] = await voting.getVoterInfo(voterAddress);
            expect(isRegistered).to.equal(true);
            expect(hasVoted).to.equal(false);
            expect(votedCandidateId).to.equal(0);
            expect(timestamp).to.equal(0);
        })

    })
    describe("start election", () => {
        beforeEach(async () => {
            await voting.connect(user0).registerCandidate("sakshi", "Bacha party", "masti karo bhai");
            await voting.connect(user0).authorizeVoter(voterAddress);

        });
        it("should emit ElectionStarted event", async () => {
            await expect(
                voting.connect(user0).startElection()
            ).to.emit(voting, "ElectionStarted")
                .withArgs(anyValue);
        })
        it("should emit VoteCasted event", async () => {
            await voting.connect(user0).startElection();
            await expect(
                voting.connect(user2).vote(1)
            ).to.emit(voting, "VoteCasted")
                .withArgs(voterAddress, 1, anyValue);
        })
    })
    describe("end election", () => {
        it("should return correct results after election ends", async () => {
            await voting.connect(user0).registerCandidate("sakshi", "party", "desc");
            await voting.connect(user0).authorizeVoter(user2.address);
            await voting.connect(user0).startElection();
            await voting.connect(user2).vote(1);
            await voting.connect(user0).endElection();

            const [ids, votes, total] = await voting.getResults();
            expect(ids[0]).to.equal(1);
            expect(votes[0]).to.equal(1);
            expect(total).to.equal(1);
        });
        it("should return the candidate with highest votes as winner", async () => {
            await voting.connect(user0).registerCandidate("sakshi", "party", "desc");
            await voting.connect(user0).authorizeVoter(user2.address);
            await voting.connect(user0).startElection();
            await voting.connect(user2).vote(1);
            await voting.connect(user0).endElection();

            const winner = await voting.getWinner();
            console.log("winner", winner);
            expect(winner.name).to.equal("sakshi");
            expect(winner.voteCount).to.equal(1);
        });
        it("should return correct election status", async () => {
            await voting.connect(user0).registerCandidate("sakshi", "party", "desc");
            await voting.connect(user0).authorizeVoter(user2.address);
            const [status, totalCandidates, totalVotes, totalVoters] = await voting.getElectionStatus();

            expect(status).to.equal(0);
            expect(totalCandidates).to.equal(1);
            expect(totalVotes).to.equal(0);
            expect(totalVoters).to.equal(1);
        });
        it("should transfer ownership to new owner", async () => {
            await voting.connect(user0).transferOwnership(user2.address);
            expect(await voting.owner()).to.equal(user2.address);
        });
    })
});
