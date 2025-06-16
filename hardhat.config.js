require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/2a243fdf6d28429bb47b35da6b0e6785",
      accounts: ["e26fd0b96e827017458a898bea026d867bea40d68c602a0842b28cf1394155a7"],
    },
  },
};
