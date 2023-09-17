import { ethers } from 'ethers'

const rawTx = "0x02f86c05018502540be4008504a817c800825208946442c72abd1a9d14c303277a8c994fae295b6bcb8080c001a0e761b3d2074283b49a499ec8af2fcf44a562848e082ba76efca1530b95e7dba2a028a6a42f7226e21c8469325b475facb30d8896cc532fa454e005a4870fea0b09"
const parsedTxData = ethers.utils.parseTransaction(rawTx)
const provider = new ethers.providers.JsonRpcProvider("https://ethereum-goerli.publicnode.com");

console.log(ethers.utils.parseUnits("2", "wei"));
console.log(ethers.utils.parseUnits("3", "wei"));
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
