import { BrowserProvider } from 'ethers';

let provider: BrowserProvider | undefined;
let signer: any; // Adjust the type of 'signer' as needed
let windowWithEthereum: any;

if (typeof window !== 'undefined') {
  windowWithEthereum = window as Window & { ethereum?: any };
  if (windowWithEthereum.ethereum) {
    provider = new BrowserProvider(windowWithEthereum.ethereum);
    signer = provider.getSigner();
  } else {
    // Handle the case where 'window.ethereum' is not available
    console.error("window.ethereum is not available");
  }
} else {
  // Handle the case where 'window' is not available
  console.error("window is not available");
}

export { provider, signer, windowWithEthereum};
