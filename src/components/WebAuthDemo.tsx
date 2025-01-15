"use client";
import React, { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WebAuthnDemo = () => {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [credential, setCredential] = useState<PublicKeyCredential | null>(
    null,
  );

  const generateRandomBuffer = (): Uint8Array => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return arr;
  };

  const registerCredential = async () => {
    try {
      setStatus("Starting registration...");
      setError("");

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
        {
          challenge: generateRandomBuffer(),
          rp: {
            name: "Local WebAuthn Demo",
            id: window.location.hostname,
          },
          user: {
            id: generateRandomBuffer(),
            name: "testuser@example.com",
            displayName: "Test User",
          },
          pubKeyCredParams: [
            {
              type: "public-key",
              alg: -7, // ES256
            },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred",
          },
          timeout: 60000,
        };

      const newCredential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      console.log("newCredential", newCredential);

      setCredential(newCredential);
      setStatus("Registration successful!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setStatus("Registration failed");
    }
  };

  const verifyCredential = async () => {
    if (!credential) {
      setError("Please register first");
      return;
    }

    try {
      setStatus("Starting authentication...");
      setError("");

      const assertionOptions: PublicKeyCredentialRequestOptions = {
        challenge: generateRandomBuffer(),
        allowCredentials: [
          {
            id: credential.rawId,
            type: "public-key",
          },
        ],
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: assertionOptions,
      });

      console.log("assertion", assertion);
      setStatus("Authentication successful!");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setStatus("Authentication failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">WebAuthn Demo</h1>

      <div className="space-y-4">
        <button
          onClick={registerCredential}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Register New Credential
        </button>

        <button
          onClick={verifyCredential}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Verify Credential
        </button>
      </div>

      {status && (
        <Alert variant={error ? "destructive" : "default"}>
          {error ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertDescription>{error || status}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WebAuthnDemo;
