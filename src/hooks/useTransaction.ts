import type { CommittedTransactionResponse } from "@aptos-labs/ts-sdk";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { aptosClient } from "../services/movement-client";

export const useTransaction = ({ showError = true }: { showError?: boolean } = {}) => {
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const executeTransaction = async <T extends { hash: string }>(transaction: Promise<T>) => {
    setTransactionInProgress(true);
    setError(null);
    let tx: T;
    let result: CommittedTransactionResponse;
    try {
      tx = await transaction;
      result = await aptosClient.waitForTransaction({ transactionHash: tx.hash });

      return {
        tx,
        result,
      };
    } catch (err) {
      const error = err as Error;
      if (showError) {
        toast({
          description: error.message || String(error),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setError(error);
      throw error;
    } finally {
      setTransactionInProgress(false);
    }
  };

  return { transactionInProgress, error, executeTransaction };
};
