import { Clock, Package, Mic, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function History() {
  const activities = [
    {
      id: 1,
      type: "voice_search",
      description: "Searched for 'wireless headphones'",
      timestamp: "2 hours ago",
      result: "Found 15 products",
      icon: Mic
    },
    {
      id: 2,
      type: "purchase",
      description: "Purchased Smart Fitness Watch",
      timestamp: "1 day ago",
      result: "$449.99",
      icon: Package
    },
    {
      id: 3,
      type: "search",
      description: "Browsed Kitchen category",
      timestamp: "2 days ago",
      result: "Viewed 8 items",
      icon: Search
    },
    {
      id: 4,
      type: "voice_search",
      description: "Asked for 'coffee maker recommendations'",
      timestamp: "3 days ago",
      result: "Found 12 products",
      icon: Mic
    },
    {
      id: 5,
      type: "purchase",
      description: "Purchased Wireless Gaming Mouse",
      timestamp: "1 week ago",
      result: "$89.99",
      icon: Package
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "voice_search":
        return "bg-primary/10 text-primary border-primary/20"
      case "purchase":
        return "bg-success/10 text-success border-success/20"
      case "search":
        return "bg-accent-warm/10 text-accent-warm border-accent-warm/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "voice_search":
        return "Voice Search"
      case "purchase":
        return "Purchase"
      case "search":
        return "Browse"
      default:
        return "Activity"
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Activity History
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your shopping journey and voice interactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card backdrop-blur-glass border border-subtle">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Voice Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">23</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card backdrop-blur-glass border border-subtle">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">$1,247</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card backdrop-blur-glass border border-subtle">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Items Viewed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-warm">156</div>
              <p className="text-xs text-muted-foreground">Products explored</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="bg-card-glass backdrop-blur-glass border border-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest shopping interactions and voice commands
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-subtle/30 hover:bg-subtle/50 transition-all duration-300">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-design-sm">
                  <activity.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium text-card-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(activity.type)}`}
                        >
                          {getTypeLabel(activity.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm font-medium text-primary">
                      {activity.result}
                    </div>
                  </div>
                </div>
                
                {index < activities.length - 1 && (
                  <div className="absolute left-9 mt-12 w-px h-6 bg-border"></div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="bg-card-glass backdrop-blur-glass border-primary/30 hover:bg-primary/10"
          >
            Export History
          </Button>
          <Button 
            variant="outline" 
            className="bg-card-glass backdrop-blur-glass border-destructive/30 hover:bg-destructive/10"
          >
            Clear History
          </Button>
        </div>

        {/* Placeholder for Future Features */}
        <Card className="bg-gradient-card backdrop-blur-glass border border-subtle">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold">More Features Coming Soon</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Advanced analytics, voice pattern recognition, and personalized shopping insights are on the way.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}