import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import PostCheckout from "./pages/PostCheckout";
import Planning from "./pages/Planning";
import Progression from "./pages/Progression";
import Matieres from "./pages/Matieres";
import Parametres from "./pages/Parametres";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/post-checkout" element={<PostCheckout />} />
            <Route
              path="/"
              element={
                <AppLayout>
                  <SubscriptionGuard>
                    <Planning />
                  </SubscriptionGuard>
                </AppLayout>
              }
            />
            <Route
              path="/progression"
              element={
                <AppLayout>
                  <SubscriptionGuard>
                    <Progression />
                  </SubscriptionGuard>
                </AppLayout>
              }
            />
            <Route
              path="/matieres"
              element={
                <AppLayout>
                  <SubscriptionGuard>
                    <Matieres />
                  </SubscriptionGuard>
                </AppLayout>
              }
            />
            <Route
              path="/parametres"
              element={
                <AppLayout>
                  <SubscriptionGuard>
                    <Parametres />
                  </SubscriptionGuard>
                </AppLayout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
