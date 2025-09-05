import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Sparkles } from "lucide-react"

interface ParsedData {
  product: string
  quantity: number
  category: string
  action: string
  status: string
}

interface ConfirmationDialogProps {
  recognizedText: string
  parsedData: ParsedData
  onConfirm: () => void
  onCancel: () => void
  isVisible: boolean
}

export function ConfirmationDialog({
  recognizedText,
  parsedData,
  onConfirm,
  onCancel,
  isVisible,
}: ConfirmationDialogProps) {
  if (!isVisible) return null

  return (
    <Card className="bg-card-glass backdrop-blur-glass border border-subtle shadow-design-lg rounded-2xl">
      <CardHeader className="pb-4 flex flex-col items-center">
        <Sparkles className="h-6 w-6 text-primary animate-pulse mb-2" />
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Voice Command Processed
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Recognized Text */}
        <div className="p-3 bg-background/60 border border-subtle rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            What I heard:
          </p>
          <p className="italic text-card-foreground">"{recognizedText}"</p>
        </div>

        {/* Parsed Info */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Extracted Information:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Product:</span>
              <Badge variant="secondary">{parsedData.product}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <Badge variant="secondary">{parsedData.quantity}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              <Badge variant="outline">{parsedData.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Action:</span>
              <Badge className="bg-gradient-accent text-white">
                {parsedData.action}
              </Badge>
            </div>
          </div>
        </div>

        {/* Confirm Buttons */}
        <div className="pt-4 border-t border-subtle">
          <p className="text-center font-medium mb-4 text-card-foreground">
            Are you sure you want to add{" "}
            <strong>
              {parsedData.quantity} {parsedData.product}
            </strong>{" "}
            to your wishlist?
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex items-center gap-2 border-subtle hover:border-primary/40"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-gradient-accent text-white hover:shadow-design-md flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Add to Wishlist
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
