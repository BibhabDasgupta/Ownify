
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Smartphone, ArrowRight, ArrowLeftRight, FileCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface ActivityItem {
  id: string;
  type: "registration" | "verification" | "transfer";
  deviceName: string;
  deviceId: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "registration",
    deviceName: "iPhone 13 Pro",
    deviceId: "IMEI-123456789012345",
    date: "2023-06-15T10:30:00",
    status: "completed"
  },
  {
    id: "act-2",
    type: "verification",
    deviceName: "MacBook Air M1",
    deviceId: "SN-C02ZW1ZXPLJG",
    date: "2023-07-22T14:45:00",
    status: "completed"
  },
  {
    id: "act-3",
    type: "transfer",
    deviceName: "Samsung Galaxy S22",
    deviceId: "IMEI-352096801425376",
    date: "2023-08-05T09:15:00",
    status: "completed"
  },
  {
    id: "act-4",
    type: "verification",
    deviceName: "iPad Pro 12.9",
    deviceId: "SN-DLXW2LL/A",
    date: "2023-09-18T16:20:00",
    status: "failed"
  },
  {
    id: "act-5",
    type: "registration",
    deviceName: "Dell XPS 15",
    deviceId: "SN-JX2P3Y2",
    date: "2023-10-02T11:05:00",
    status: "pending"
  }
];

export default function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities);
  const [filter, setFilter] = useState<"all" | "registration" | "verification" | "transfer">("all");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user-token"));
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    setIsLoggedIn(!!token);

    if (!token) {
      toast.error("Need login for viewing activity", {
        description: "Please log in to view your activity history.",
        action: {
          label: "Login",
          onClick: () => navigate("/dashboard"),
        },
        className: "bg-red-500 text-white border-red-600",
      });
    }
  }, [navigate]);

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "registration":
        return <FileCheck className="h-5 w-5 text-emerald-500" />;
      case "verification":
        return <Smartphone className="h-5 w-5 text-blue-500" />;
      case "transfer":
        return <ArrowLeftRight className="h-5 w-5 text-purple-500" />;
    }
  };

  const getStatusColor = (status: ActivityItem["status"]) => {
    switch (status) {
      case "completed":
        return "text-emerald-500 bg-emerald-500/10";
      case "pending":
        return "text-amber-500 bg-amber-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="page-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Activity History</h1>
              <p className="text-muted-foreground mt-1">
                Track your device ownership activities
              </p>
            </div>
          </div>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Device Activities</CardTitle>
              <CardDescription>
                View your recent device registration, verification, and transfer activities
              </CardDescription>
              <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-2">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="registration">Registrations</TabsTrigger>
                  <TabsTrigger value="verification">Verifications</TabsTrigger>
                  <TabsTrigger value="transfer">Transfers</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities found
                  </div>
                ) : (
                  filteredActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className={`rounded-full p-2 ${
                        activity.type === 'registration' ? 'bg-emerald-500/10' :
                        activity.type === 'verification' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-lg capitalize">
                              {activity.type === 'registration' ? 'Device Registration' :
                               activity.type === 'verification' ? 'Device Verification' : 'Device Transfer'}
                            </h3>
                            <p className="text-muted-foreground">{activity.deviceName}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            <Smartphone className="h-3.5 w-3.5" />
                            <span>Device ID: {activity.deviceId}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(activity.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{formatTime(activity.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="self-center">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
