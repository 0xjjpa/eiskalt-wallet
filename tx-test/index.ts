import { ethers } from 'ethers'

const rawTx = "0x02f87782012907852e90edd00085ba43b74000830f4240946442c72abd1a9d14c303277a8c994fae295b6bcb880de0b6b3a764000080c001a034b91e89c23fdebf4bb16315885f8c8a3592b7f8a77be65b0ea632e7cd7c1d7ca00f2c914edac9297ce0242903ad80e22e1f128c07c5d4b3b182095e8802bc04ad"
const parsedTxData = ethers.utils.parseTransaction(rawTx)
const provider = new ethers.providers.JsonRpcProvider("https://previewnet.hashio.io/api");

console.log(ethers.utils.parseUnits("2", "wei"));
console.log(ethers.utils.parseUnits("8", "wei"));
console.log("Parsed data", parsedTxData);

async function sendRawTransaction() {
    // Send the transaction
    const txResponse = await provider.sendTransaction(rawTx);
    console.log("Transaction hash:", txResponse.hash);

    // If you want to wait for it to be mined, you can also do:
    const receipt = await txResponse.wait();
    console.log("Transaction was mined in block:", receipt.blockNumber);
}

sendRawTransaction().catch(console.error);
