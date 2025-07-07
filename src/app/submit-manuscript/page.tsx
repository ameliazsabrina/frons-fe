"use client";
import type React from "react";
import { useState, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircleIcon,
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  XIcon,
  LinkIcon,
} from "lucide-react";
import { ResearchCategorySelector } from "@/components/ui/research-category-selector";
import { CVRegistrationGuard } from "@/components/ui/cv-registration-guard";
import { WalletConnection } from "@/components/wallet-connection";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import { useManuscriptSubmission } from "@/hooks/useManuscriptSubmission";
import { Toaster } from "@/components/ui/toaster";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { DEVNET_USDCF_ADDRESS, ESCROW_ADDRESS } from "@/lib/constants/solana";

export default function SubmitManuscriptPage() {
  const { toast } = useToast();
  const { authenticated: connected, user } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  // Find the first Solana wallet
  const solanaWallet = solanaWallets[0];
  const validSolanaPublicKey =
    solanaWallet?.address && isValidSolanaAddress(solanaWallet.address)
      ? solanaWallet.address
      : undefined;

  if (typeof window !== "undefined") {
    console.log("Solana wallets:", solanaWallets);
    console.log("Solana wallet:", solanaWallet);
    console.log("Solana address:", validSolanaPublicKey);
  }

  const { checkCVRegistration } = useCVRegistration(validSolanaPublicKey);
  const router = useRouter();
  const { isLoading } = useLoading();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const { submitManuscript } = useManuscriptSubmission({
    checkCVRegistration: checkCVRegistration,
  });

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    abstract: "",
    keywords: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [cvVerified, setCvVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ipfsData, setIpfsData] = useState<{
    cid: string;
    ipfsUrl: string;
  } | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const getArrayFromCommaString = (str: string) => {
    return str
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getCommaStringFromArray = (arr: string[]) => {
    return arr.join(", ");
  };

  const authors = useMemo(
    () => getArrayFromCommaString(formData.author),
    [formData.author]
  );
  const keywords = useMemo(
    () => getArrayFromCommaString(formData.keywords),
    [formData.keywords]
  );

  const handleCVVerified = useCallback(() => {
    setCvVerified(true);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleRemoveItem = (field: string, itemToRemove: string) => {
    const items = getArrayFromCommaString(
      formData[field as keyof typeof formData] as string
    );
    const updatedItems = items.filter((item) => item !== itemToRemove);
    handleInputChange(field, getCommaStringFromArray(updatedItems));
  };

  const handleCategoriesChange = (categories: string[]) => {
    setFormData((prev) => ({
      ...prev,
      category: categories.join(", "),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.author.trim()) return "Author is required";
    if (!formData.category.trim()) return "Category is required";
    if (!formData.abstract.trim()) return "Abstract is required";
    if (!formData.keywords.trim()) return "Keywords are required";
    if (!selectedFile) return "Manuscript file is required";
    if (!validSolanaPublicKey) return "Valid wallet connection required";
    if (!cvVerified) return "CV verification required";
    return null;
  };

  const handlePayment = async () => {
    if (!solanaWallet || !validSolanaPublicKey) {
      throw new Error("Solana wallet not connected");
    }

    setPaymentProcessing(true);
    try {
      const connection = new (await import("@solana/web3.js")).Connection(
        "https://devnet.helius-rpc.com/?api-key=3451b7c4-f90f-451e-a4b5-c51966815b43"
      );

      const userPublicKey = new PublicKey(validSolanaPublicKey);
      const usdcfMint = new PublicKey(DEVNET_USDCF_ADDRESS);
      const escrowPublicKey = new PublicKey(ESCROW_ADDRESS);

      // Get associated token accounts
      const userTokenAccount = await getAssociatedTokenAddress(
        usdcfMint,
        userPublicKey
      );
      const escrowTokenAccount = await getAssociatedTokenAddress(
        usdcfMint,
        escrowPublicKey
      );

      const transaction = new Transaction();

      // Check if user token account exists
      const userAccountInfo = await connection.getAccountInfo(userTokenAccount);
      if (!userAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPublicKey,
            userTokenAccount,
            userPublicKey,
            usdcfMint
          )
        );
      }

      // Check if escrow token account exists
      const escrowAccountInfo = await connection.getAccountInfo(
        escrowTokenAccount
      );
      if (!escrowAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPublicKey,
            escrowTokenAccount,
            escrowPublicKey,
            usdcfMint
          )
        );
      }

      // Transfer $50 USDCF (assuming 6 decimals for USDCF)
      const amount = 50 * Math.pow(10, 6); // $50 with 6 decimals
      transaction.add(
        createTransferInstruction(
          userTokenAccount,
          escrowTokenAccount,
          userPublicKey,
          amount
        )
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      // Sign and send transaction
      const signature = await solanaWallet.sendTransaction(
        transaction,
        connection
      );

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      console.log("Payment successful:", signature);
      return signature;
    } catch (error) {
      console.error("Payment failed:", error);
      throw error;
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
        className: "bg-red-500 text-white border-none",
      });
      setError(validationError);
      return;
    }

    if (!selectedFile || !validSolanaPublicKey || !solanaWallet) {
      toast({
        title: "Error",
        description: "Please connect your Solana wallet and select a file",
        variant: "destructive",
        className: "bg-red-500 text-white border-none",
      });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitProgress(0);
      setError(null);
      setSuccess(null);
      setIpfsData(null);

      // Step 1: Process payment
      setSubmitProgress(10);
      toast({
        title: "Processing Payment",
        description: "Please approve the $50 USDCF payment to escrow...",
        className: "bg-blue-500 text-white border-none",
      });

      const paymentSignature = await handlePayment();

      setSubmitProgress(30);
      toast({
        title: "Payment Successful",
        description: "Payment processed successfully. Submitting manuscript...",
        className: "bg-green-500 text-white border-none",
      });

      // Step 2: Submit manuscript with metadata
      setSubmitProgress(50);
      const result = await submitManuscript(
        selectedFile,
        {
          title: formData.title,
          authors: getArrayFromCommaString(formData.author).map((name) => ({
            name,
          })),
          categories: getArrayFromCommaString(formData.category),
          abstract: formData.abstract,
          keywords: getArrayFromCommaString(formData.keywords),
          walletAddress: validSolanaPublicKey,
        },
        apiUrl
      );

      if (!result) {
        throw new Error("Failed to submit manuscript");
      }

      setSubmitProgress(100);
      const successMsg = `Manuscript "${formData.title}" submitted successfully!`;
      toast({
        title: "Success!",
        description: successMsg,
        className: "bg-green-500 text-white border-none",
      });
      setSuccess(successMsg);

      setIpfsData({
        cid: result.manuscript.cid,
        ipfsUrl: result.ipfsUrls.manuscript,
      });

      toast({
        title: "IPFS Links",
        description: (
          <div className="space-y-2">
            <p>Your manuscript has been uploaded to IPFS:</p>
            <a
              href={result.ipfsUrls.manuscript}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-100 hover:text-blue-200 underline block"
            >
              View Manuscript
            </a>
            <p className="text-sm mt-2">
              Payment Transaction: {paymentSignature}
            </p>
          </div>
        ),
        className: "bg-primary text-white border-none",
      });

      setFormData({
        title: "",
        author: "",
        category: "",
        abstract: "",
        keywords: "",
      });
      setSelectedFile(null);

      setTimeout(() => {
        router.push("/overview");
      }, 5000);
    } catch (err: any) {
      console.error("Failed to submit manuscript:", err);

      let errorMsg = "Failed to submit manuscript. Please try again.";
      if (
        err.message?.includes("Payment failed") ||
        err.message?.includes("insufficient funds")
      ) {
        errorMsg =
          "Payment failed. Please ensure you have sufficient USDCF balance.";
      } else if (err.response?.data?.code === "CV_REQUIRED") {
        errorMsg = err.response.data.message;
        setTimeout(() => {
          router.push("/register-cv");
        }, 2000);
      } else if (err.response?.data?.code === "MISSING_WALLET") {
        errorMsg =
          err.response.data.message || "Valid wallet connection required.";
      } else if (err.response?.data?.code === "PINATA_ERROR") {
        errorMsg = "IPFS upload failed. Please try again later.";
      } else if (err.response?.data?.code === "NETWORK_ERROR") {
        errorMsg = "Network connection failed. Please check your connection.";
      } else if (err.response?.status === 503) {
        errorMsg = "Service temporarily unavailable. Please try again later.";
      } else if (err.response?.status === 429) {
        errorMsg = "Too many requests. Please wait a moment and try again.";
      }

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
        className: "bg-red-500 text-white border-none",
      });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
      setSubmitProgress(0);
    }
  };

  if (!connected || !validSolanaPublicKey) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4">
                <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-primary">
                    Submit Manuscript
                  </span>
                </div>
              </div>
            </div>
            <div className="container max-w-5xl mx-auto px-6 py-12">
              <div className="mb-12 text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                  Submit Manuscript
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                  Share your research with the academic community through our
                  blockchain-powered platform
                </p>
              </div>
              <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                <CardHeader className="text-center py-8">
                  <CardTitle className="text-2xl text-primary">
                    Authentication Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  <p className="text-muted-foreground mb-8 text-center text-lg">
                    Please connect your wallet to submit manuscripts.
                  </p>
                  <div className="flex justify-center">
                    <WalletConnection />
                  </div>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
          <Toaster />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
        <OverviewSidebar connected={connected} />
        <SidebarInset className="flex-1">
          <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4">
              <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-primary">
                  Submit Manuscript
                </span>
              </div>
            </div>
          </div>
          <div className="container max-w-6xl mx-auto px-6 lg:px-8 py-12">
            <CVRegistrationGuard
              walletAddress={validSolanaPublicKey || ""}
              onCVVerified={handleCVVerified}
            >
              <div className="mb-12 text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                  Submit Manuscript
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                  Share your research with the academic community through our
                  blockchain-powered platform
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-primary/50 to-primary mx-auto rounded-full"></div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-8 max-w-4xl mx-auto"
              >
                {ipfsData && (
                  <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="border-b border-gray-100/50 pb-6">
                      <div className="flex items-center space-x-3">
                        <div>
                          <CardTitle className="text-2xl text-primary font-bold">
                            IPFS Information
                          </CardTitle>
                          <p className="text-muted-foreground mt-1">
                            Your manuscript has been stored on IPFS
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-8">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <LinkIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground block">
                              CID
                            </span>
                            <span className="text-base text-primary font-medium">
                              {ipfsData.cid}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(ipfsData.ipfsUrl, "_blank")
                          }
                          className="hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          View on IPFS
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                  <CardHeader className="border-b border-gray-100/50 pb-6">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="text-2xl text-primary font-bold">
                          Basic Information
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          Provide essential details about your manuscript
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-8">
                    <div className="space-y-3">
                      <Label
                        htmlFor="title"
                        className="text-base font-semibold text-primary flex items-center"
                      >
                        Manuscript Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Enter your manuscript title"
                        className="text-base border-primary/20 focus:border-primary focus:ring-primary/30"
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="author"
                        className="text-base font-semibold text-primary"
                      >
                        Author(s) *
                      </Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) =>
                          handleInputChange("author", e.target.value)
                        }
                        placeholder="Enter author names separated by commas"
                        className="text-base border-primary/20 focus:border-primary focus:ring-primary/30"
                        disabled={submitting}
                      />
                      {authors.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {authors.map((author, index) => (
                            <Badge
                              key={`${author}-${index}`}
                              variant="secondary"
                              className="pl-3 pr-2 py-1 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              {author}
                              <button
                                onClick={() =>
                                  handleRemoveItem("author", author)
                                }
                                className="hover:text-red-600 transition-colors focus:outline-none"
                                type="button"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-primary">
                        Research Category *
                      </Label>
                      <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                        <ResearchCategorySelector
                          selectedCategories={
                            formData.category
                              ? formData.category.split(", ")
                              : []
                          }
                          onCategoriesChange={handleCategoriesChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                  <CardHeader className="border-b border-gray-100/50 pb-6">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="text-2xl text-primary font-bold">
                          Abstract & Keywords
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          Describe your research and key terms
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-8">
                    <div className="space-y-3">
                      <Label
                        htmlFor="abstract"
                        className="text-base font-semibold text-primary"
                      >
                        Abstract *
                      </Label>
                      <Textarea
                        id="abstract"
                        value={formData.abstract}
                        onChange={(e) =>
                          handleInputChange("abstract", e.target.value)
                        }
                        placeholder="Enter your manuscript abstract"
                        className="min-h-[150px] text-base border-primary/20 focus:border-primary focus:ring-primary/30 leading-relaxed"
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="keywords"
                        className="text-base font-semibold text-primary flex items-center"
                      >
                        Keywords *
                      </Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) =>
                          handleInputChange("keywords", e.target.value)
                        }
                        placeholder="Enter keywords separated by commas"
                        className="text-base border-primary/20 focus:border-primary focus:ring-primary/30"
                        disabled={submitting}
                      />
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {keywords.map((keyword, index) => (
                            <Badge
                              key={`${keyword}-${index}`}
                              variant="secondary"
                              className="pl-3 pr-2 py-1 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              {keyword}
                              <button
                                onClick={() =>
                                  handleRemoveItem("keywords", keyword)
                                }
                                className="hover:text-red-600 transition-colors focus:outline-none"
                                type="button"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Separate multiple keywords with commas (e.g., machine
                        learning, artificial intelligence, data science)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                  <CardHeader className="border-b border-gray-100/50 pb-6">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="text-2xl text-primary font-bold">
                          Manuscript File
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          Upload your research document
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-8">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-primary">
                        Upload Manuscript (PDF) *
                      </Label>
                      <p className="text-muted-foreground">
                        Upload your manuscript in PDF format. Maximum file size
                        is 10MB.
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300/80 rounded-xl p-8 text-center hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="manuscript-upload"
                        disabled={submitting}
                      />
                      <label
                        htmlFor="manuscript-upload"
                        className="cursor-pointer flex flex-col items-center space-y-4"
                      >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <UploadIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-lg text-foreground font-medium">
                            {selectedFile
                              ? selectedFile.name
                              : "Click to select your manuscript file"}
                          </span>
                          <span className="text-sm text-muted-foreground block">
                            PDF format only (max 10MB)
                          </span>
                        </div>
                      </label>
                    </div>

                    {selectedFile && (
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <FileTextIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="text-base text-primary font-medium block">
                              {selectedFile.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          disabled={submitting}
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {submitting && (
                  <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                    <CardContent className="pt-8 pb-8">
                      <div className="space-y-4 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                        <div className="flex justify-between text-base font-medium">
                          <span className="text-primary">
                            Submitting your manuscript...
                          </span>
                          <span className="text-primary">
                            {submitProgress}%
                          </span>
                        </div>
                        <Progress
                          value={submitProgress}
                          className="w-full h-3 rounded-full bg-primary/10"
                        />
                        <p className="text-sm text-muted-foreground text-center">
                          Please wait while we process and submit your
                          manuscript
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    disabled={submitting || !cvVerified || paymentProcessing}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {paymentProcessing
                      ? "Processing Payment..."
                      : submitting
                      ? "Submitting..."
                      : "Submit Manuscript ($50 USDCF)"}
                  </Button>
                </div>
              </form>
            </CVRegistrationGuard>
          </div>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
