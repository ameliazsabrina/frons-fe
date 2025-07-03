import { useDynamicWaas } from "@dynamic-labs/sdk-react-core";
import { ChainEnum } from "@dynamic-labs/sdk-api-core";

export function useWalletManager() {
  const {
    createWalletAccount,
    dynamicWaasIsEnabled,
    getWaasWallets,
    importPrivateKey,
  } = useDynamicWaas();

  const handleCreateWallet = async (chains: ChainEnum[] = [ChainEnum.Sol]) => {
    if (!dynamicWaasIsEnabled) {
      throw new Error("Dynamic WaaS is not enabled");
    }

    try {
      const wallets = await createWalletAccount(chains);
      console.log("Created wallets:", wallets);
      return wallets;
    } catch (error) {
      console.error("Failed to create wallet:", error);
      throw error;
    }
  };

  const handleImportKey = async (chainName: ChainEnum, privateKey: string) => {
    try {
      await importPrivateKey({
        chainName,
        privateKey,
      });
      console.log("Private key imported successfully");
    } catch (error) {
      console.error("Failed to import private key:", error);
      throw error;
    }
  };

  const waasWallets = getWaasWallets();
  const solWallets = waasWallets.filter((wallet) => wallet.chain === "SOL");

  return {
    createWalletAccount: handleCreateWallet,
    importPrivateKey: handleImportKey,
    getWaasWallets,
    dynamicWaasIsEnabled,
    waasWallets,
    solWallets,
  };
}
