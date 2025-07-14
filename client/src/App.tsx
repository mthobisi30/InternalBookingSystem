import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Resources from "@/pages/resources";
import Bookings from "@/pages/bookings";
import NotFound from "@/pages/not-found";

function Router() {
  const [createBookingModalOpen, setCreateBookingModalOpen] = useState(false);

  const handleCreateBooking = () => {
    setCreateBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreateBooking={handleCreateBooking} />
      <div className="pt-16">
        <Switch>
          <Route path="/" component={() => <Dashboard onCreateBooking={handleCreateBooking} />} />
          <Route path="/resources" component={Resources} />
          <Route path="/bookings" component={() => (
            <Bookings 
              createModalOpen={createBookingModalOpen} 
              setCreateModalOpen={setCreateBookingModalOpen} 
            />
          )} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
