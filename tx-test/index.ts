import { ethers } from 'ethers'

const rawTx = "0x02f86c05018502540be4008504a817c800825208946442c72abd1a9d14c303277a8c994fae295b6bcb8080c080a015248f0e209f101d14115adc28ab3a3fdf98bc91efa95905a313c9c94e8b6b52a04fc158f315d3422a51e3330cd926990751c9f0572c1f0a999453d248ff2293aa"
const parsedTxData = ethers.utils.parseTransaction(rawTx)
const provider = new ethers.providers.JsonRpcProvider("https://previewnet.hashio.io/api");

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
