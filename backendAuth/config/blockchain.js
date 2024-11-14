require("dotenv").config();
const { Web3 } = require("web3");
const abi  = require("../AuthLoggerABI.json");

const web3 = new Web3("https://rpc-amoy.polygon.technology");
const contractAddress = process.env.CONTRACT_ADDRESS; // Replace with your deployed contract address
const authLoggerContract = new web3.eth.Contract(abi, contractAddress);

module.exports = { web3, authLoggerContract };
