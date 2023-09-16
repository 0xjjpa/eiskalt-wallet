import { ethers } from 'ethers'

const rawTx = "0x02f86d018085746a5288008601d1a94a2000825208946442c72abd1a9d14c303277a8c994fae295b6bcb8080c080a0646d3924d288fb1dd54f2b8a7a4598c3a5c4832ceb769dd8c9ab22cbbf8eeb9da027d0a9af64310038cd18098275ad17c31de640727d27cda323e2c922ef4c91be"
const parsedTxData = ethers.utils.parseTransaction(rawTx)

console.log(ethers.utils.parseUnits("5", "gwei"));
console.log(ethers.utils.parseUnits("20", "gwei"));
console.log("Parsed data", parsedTxData);
