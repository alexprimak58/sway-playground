import { ContractFactory, JsonAbi, StorageSlot } from "fuels";
import { useMutation } from "@tanstack/react-query";
import { useFuel, useWallet } from "@fuels/react";
import { track } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import { toMetricProperties } from "../../../utils/metrics";
import Timeout from "await-timeout";

const DEPLOYMENT_TIMEOUT_MS = 120000;

export interface DeployContractData {
  contractId: string;
  networkUrl: string;
}

export function useDeployContract(
  abi: string,
  bytecode: string,
  storageSlots: string,
  onError: (error: Error) => void,
  onSuccess: (data: DeployContractData) => void,
  updateLog: (entry: string) => void,
) {
  const { wallet, isLoading: walletIsLoading } = useWallet();
  const { fuel } = useFuel();
  const [metricMetadata, setMetricMetadata] = useState({});

  useEffect(() => {
    const waitForMetadata = async () => {
      const name = fuel.currentConnector()?.name ?? "none";
      const networkUrl = wallet?.provider.url ?? "none";
      const version = (await wallet?.provider.getVersion()) ?? "none";
      setMetricMetadata({ name, version, networkUrl });
    };
    waitForMetadata();
  }, [wallet, fuel]);

  const mutation = useMutation({
    // Retry once if the wallet is still loading.
    retry: walletIsLoading && !wallet ? 1 : 0,
    onSuccess,
    onError: (error) => {
      track("Deploy Error", toMetricProperties(error, metricMetadata));
      onError(error);
    },
    mutationFn: async (): Promise<DeployContractData> => {
      if (!wallet) {
        if (walletIsLoading) {
          updateLog("Connecting to wallet...");
        } else {
          throw new Error("Failed to connect to wallet", {
            cause: { source: "wallet" },
          });
        }
      }

      const resultPromise = new Promise(
        (resolve: (data: DeployContractData) => void, reject) => {
          const contractFactory = new ContractFactory(
            bytecode,
            JSON.parse(abi) as JsonAbi,
            wallet,
          );

          contractFactory
            .deployContract({
              storageSlots: JSON.parse(storageSlots) as StorageSlot[],
            })
            .then((contract) => {
              resolve({
                contractId: contract.id.toB256(),
                networkUrl: contract.provider.url,
              });
            })
            .catch((error) => {
              // This is a hack to handle the case where the deployment failed because the user rejected the transaction.
              const source = error?.code === 0 ? "user" : "sdk";
              error.cause = { source };
              reject(error);
            });
        },
      );

      return Timeout.wrap(
        resultPromise,
        DEPLOYMENT_TIMEOUT_MS,
        `Request timed out after ${DEPLOYMENT_TIMEOUT_MS / 1000} seconds`,
      );
    },
  });

  return mutation;
}
