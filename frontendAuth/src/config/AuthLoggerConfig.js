// src/AuthLoggerConfig.js
export const contractABI = [
  {
    inputs: [{ internalType: "string", name: "status", type: "string" }],
    name: "recordLogin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getLoginAttempts",
    outputs: [
      {
        components: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "string", name: "status", type: "string" },
        ],
        internalType: "struct AuthLogger.LoginAttempt[]",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const contractAddress = "0x3Da05A19e1551E5693069BEf7C75C9525f0f8051"; // Replace with the deployed contract address
