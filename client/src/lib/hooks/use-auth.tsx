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
      const token = localStorage.getItem('jwtToken');
      const res = await axios.get(`${API_BASE_URL}/auth/personal_information`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the Authorization header with the token
          },
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
      const signer = await provider?.getSigner();
      const address = signer?.address;
      const res = await axios.get(`${API_BASE_URL}/auth/generate-nonce/${address}`, { withCredentials: true });

      // Create message
      const messageRaw = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Wysdom.",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce: res.data.nonce,
      });

      const message = messageRaw.prepareMessage();

      // Get signature
      const signature = await signer?.signMessage(message);

      // Send to server
      const response = await axios.post(
        `${API_BASE_URL}/auth/verify`,
        { message, signature, address },
        {
          headers: {
            Authorization: `Bearer ${res.data.token}`, // Set the Authorization header with the token
          },
        },
      );

      // Validate JWT on the client side
      if (response.data && response.data.token) {
        // Store the JWT token in local storage or state for future requests
        localStorage.setItem('jwtToken', response.data.token);

        // Perform any additional actions after successful JWT validation
        set({ address, loggedIn: true });
      } else {
        console.error("JWT validation failed");
      }
    } catch (err) {
      console.log("error", err);
    }
  },

  disconnectWallet: () => {
    set({ address: "", loggedIn: false }); // Clear address and set loggedIn to false
  },
}));

export default useAuth;
