import { ethers } from 'ethers'

const rawTx = "0x02f86d018085746a5288008601d1a94a2000825208946442c72abd1a9d14c303277a8c994fae295b6bcb8080c001a054fde9f2eea67d21a7c75bdb4ae4e7aae088d132b9b62f10736e36bf52bbcae7a03da235e79fd262122ecd44eb4b1995e388718b7a90317e278af36516f7f04ae6"
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
