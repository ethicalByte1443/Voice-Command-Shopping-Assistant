import { useState, useEffect } from "react";
import { Search, Grid, List, Star, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const username = "aseem";

export default function Store() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ✅ Backend fetch
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/store");
      const data = await res.json();

      setProducts(data);
      setCategories(["All", ...new Set(data.map((p: any) => p.category))]);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Filtering + Searching + Sorting
  const filteredProducts = products
    .filter(
      (p) =>
        (p.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedCategory === "All" || p.category === selectedCategory)
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? "fill-warning text-warning"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  const handleAddToWishlist = async (item: any) => {
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
        // 🚨 If backend sends 400 (already exists) or any error
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
    } catch (error) {
      console.error(error);
      toast({
        title: "❌ Error",
        description: "Something went wrong while adding to wishlist.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Product Store
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover amazing products curated for you
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-9"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-9"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card-glass backdrop-blur-glass border border-subtle">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filter */}
              <Select
                onValueChange={setSelectedCategory}
                value={selectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sorting */}
              <Select onValueChange={setSortBy} value={sortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="bg-muted h-32 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-muted h-4 rounded"></div>
                    <div className="bg-muted h-3 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {filteredProducts.map((p: any) => (
              <Card
                key={p._id?.$oid || p._id}
                className={`group bg-card-glass backdrop-blur-glass border border-subtle hover:border-primary/30 transition-all duration-300 hover:shadow-design-md hover:scale-105 cursor-pointer ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                {/* Image / Icon */}
                <div
                  className={viewMode === "list" ? "w-48 flex-shrink-0" : ""}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    {p.quantity === 0 && (
                      <Badge className="absolute top-3 right-3 z-10 bg-muted">
                        Out of Stock
                      </Badge>
                    )}
                    <div className="h-48 bg-gradient-card flex items-center justify-center">
                      <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {p.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {renderStars(p.rating || 0)}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {p.product}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {p.description || "No description available"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          ₹{p.price}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stock: {p.quantity}
                      </div>
                    </div>

                    {p.quantity > 0 ? (
                      <Button
                        className="w-full bg-gradient-accent hover:scale-105 transition-all duration-300"
                        onClick={() => handleAddToWishlist(p)} // ✅ pass full product object, not p.product
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add to Wishlist
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-muted text-muted-foreground"
                        disabled
                      >
                        Out of Stock
                      </Button>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <Card className="bg-card-glass backdrop-blur-glass border border-subtle">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
