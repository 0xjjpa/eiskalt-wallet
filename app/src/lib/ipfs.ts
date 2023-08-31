export const uploadJSONToIPFS = async ({ message }: { message: string }) => {
  const fetchOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_API_KEY}`
    },
    body: JSON.stringify({ message }),
  }
  const response = await (await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', fetchOptions)).json()
  return `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`
}

export const readFromIPFSURL = async (url: string) => {
  const fetchOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  }
  const response = await (await fetch(url, fetchOptions)).json()
  return response;
}