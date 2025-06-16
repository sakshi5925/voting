const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying the smart contract...");

    const Voting = await ethers.getContractFactory("VotingSystem");
    const accounts = await ethers.getSigners();
    const voting = await  Voting.connect(accounts[0]).deploy();

    await voting.waitForDeployment();  

    console.log(`VotingSystem contract deployed to: ${voting.target}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });