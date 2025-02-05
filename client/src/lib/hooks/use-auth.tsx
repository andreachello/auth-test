/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { create } from "zustand";

import { SiweMessage } from "siwe";
import { JsonRpcSigner } from "ethers";
import { API_BASE_URL } from "../constants";
import { provider } from "../initializers";
// import { useSDK } from '@metamask/sdk-react'

type TAuthStore = {
  address: JsonRpcSigner | string;
  ready: boolean;
  loggedIn: boolean;
  connectWallet(): void;
  connectMetaMask(sdk: any): void;
  connectWalletConnect(): void;
  signin(): void;
  disconnectWallet(): void;
  init(): void;
};

export const useAuth = create<TAuthStore>((set) => ({
  address: "",
  loggedIn: false,
  ready: false,

  init: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/personal_information`, {
        withCredentials: true,
      });

      set({ address: res.data.address, loggedIn: true, ready: true });
    } catch (err) {
      if (provider) {
        const accounts = await provider.listAccounts();

        if (accounts[0]) {
          set({ ready: true, address: accounts[0] });
        } else {
          set({ ready: true });
        }
      }
    }
  },

  connectWallet: async () => {
    if (provider) {
      const accounts = await provider
        .send("eth_requestAccounts", [])
        .catch(() => console.log("user rejected request"));

      if (accounts[0]) {
        set({ address: accounts[0] });
      }
    }
  },

  connectMetaMask: async (sdk) => {
    try {
      const accounts = await sdk?.connect();

      if (accounts && (accounts as any)[0]) {
        set({ address: (accounts as any)[0] });
      }
      useAuth.getState().signin();
    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  },

  connectWalletConnect: async () => {
    try {
      // const accounts = await sdk?.connect();
      // if (accounts && (accounts as any)[0]) {
      //   set({ address: (accounts as any)[0] })
      // }
      // authStore.getState().signin();
    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  },

  signin: async () => {
    try {
      // Get nonce
      const res = await axios.get(`${API_BASE_URL}/auth/generate-nonce`, { withCredentials: true });
      const signer = await provider?.getSigner();
      const address = signer?.address;

      // Create message
      const messageRaw = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Wysdom.",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce: res.data,
      });

      const message = messageRaw.prepareMessage();

      // Get signature
      const signature = await signer?.signMessage(message);

      // Send to server
      await axios.post(
        `${API_BASE_URL}/auth/verify`,
        { message, signature, address },
        { withCredentials: true },
      );

      set({ address, loggedIn: true });
    } catch (err) {
      console.log("error", err);
    }
  },

  disconnectWallet: () => {
    set({ address: "", loggedIn: false }); // Clear address and set loggedIn to false
  },
}));

export default useAuth;
