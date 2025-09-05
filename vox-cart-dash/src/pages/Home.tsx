import React, { useState, useEffect } from "react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface WishlistItem {
  product: string;
  category: string;
  quantity: number;
}

interface Recommendation {
  product: string;
  category: string;
  price: number;
  quantity: number;
}

interface ApiResponse {
  recognized_text: string;
  llm_response: any;
}

const username = "aseem"; // fixed for now

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { toast } = useToast();

  // Load wishlist
  const loadWishlist = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/wishlist/${username}`);
      const data = await res.json();
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
    }
  };

  // Load recommendations
  const loadRecommendations = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/recommendations/${username}`
      );
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Recommendations fetch error:", err);
    }
  };

  useEffect(() => {
    loadWishlist();
    loadRecommendations();
  }, []);

  // Voice recording finished
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");

      const response = await fetch(
        "http://127.0.0.1:8000/recognise_text_to_llm",
        {
          method: "POST",
          body: formData,
        }
      );

      const data: ApiResponse = await response.json();
      setApiResponse(data);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error",
        description: "Failed to process voice input",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/manual_add_item_wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            product: item.product,
            category: item.category,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // 🚨 Handle backend error (400, 404, etc.)
        toast({
          title: "❌ Error",
          description: data.detail || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      // ✅ Success
      toast({
        title: "✅ Success",
        description: data.message,
      });

      await loadWishlist();
      await loadRecommendations();
    } catch (error) {
      console.error(error);
      toast({
        title: "❌ Error",
        description: "Something went wrong while adding to wishlist.",
        variant: "destructive",
      });
    }
  };

  // Confirm update
  const handleConfirm = async () => {
    if (!apiResponse) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/update_wishlist/${username}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiResponse.llm_response),
        }
      );

      const result = await response.json();

      if (result.message) {
        toast({
          title: "✅ Success",
          description: result.message,
        });
        await loadWishlist();
        await loadRecommendations();
      } else {
        toast({
          title: "❌ Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update wishlist error:", error);
      toast({
        title: "❌ Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }

    setShowConfirmation(false);
    setApiResponse(null);
  };

  // Cancel update
  const handleCancel = () => {
    setShowConfirmation(false);
    setApiResponse(null);
    toast({
      title: "Cancelled",
      description: "Item was not added to wishlist",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto flex items-center justify-between bg-gradient-card backdrop-blur-glass border border-subtle shadow-design-lg rounded-2xl p-6 mb-12">
          {/* Left Side - Heading */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Voice Shopping Assistant
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Speak to add items and get recommendations.
            </p>
          </div>

          {/* Right Side - Mic Button */}
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isProcessing}
          />
        </div>

        {/* Confirmation Dialog */}
        {apiResponse && (
          <div className="max-w-lg mx-auto mb-12">
            <ConfirmationDialog
              recognizedText={apiResponse.recognized_text}
              parsedData={apiResponse.llm_response}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isVisible={showConfirmation}
            />
          </div>
        )}

        {/* Wishlist Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">🛒 Your Wishlist</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.length > 0 ? (
              wishlist.map((item, i) => (
                <Card
                  key={i}
                  className="group bg-card-glass backdrop-blur-glass border border-subtle hover:border-primary/30 transition-all duration-300 hover:shadow-design-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {item.product}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Qty: {item.quantity}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No items in wishlist</p>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Recommended for You</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {recommendations.length > 0 ? (
              recommendations.map((item, i) => (
                <Card
                  key={i}
                  className="group bg-card-glass backdrop-blur-glass border border-subtle hover:border-primary/30 transition-all duration-300 hover:shadow-design-md hover:scale-105 cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {item.product}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Stock:{" "}
                      {item.quantity > 0 ? item.quantity : "Out of Stock"}
                    </p>
                    {item.quantity > 0 ? (
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-gradient-accent hover:scale-105 transition-all duration-300"
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No recommendations found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
