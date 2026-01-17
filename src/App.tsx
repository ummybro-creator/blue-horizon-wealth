import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Team from "./pages/Team";
import Profile from "./pages/Profile";
import Recharge from "./pages/Recharge";
import Withdraw from "./pages/Withdraw";
import CheckIn from "./pages/CheckIn";
import Support from "./pages/Support";
import Telegram from "./pages/Telegram";
import Login from "./pages/Login";
import Records from "./pages/Records";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/team" element={<Team />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recharge" element={<Recharge />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/bonus" element={<CheckIn />} />
          <Route path="/support" element={<Support />} />
          <Route path="/telegram" element={<Telegram />} />
          <Route path="/login" element={<Login />} />
          <Route path="/records" element={<Records />} />
          <Route path="/wallet" element={<Index />} />
          <Route path="/bank-details" element={<Profile />} />
          <Route path="/security" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
