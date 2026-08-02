import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// ===== Eager: first screens the user can land on =====
import Index from "./pages/Index";
import Login from "./pages/Login";

// ===== Lazy: everything else (loaded on demand) =====
const Register = lazy(() => import("./pages/Register"));
const Products = lazy(() => import("./pages/Products"));
const Team = lazy(() => import("./pages/Team"));
const Profile = lazy(() => import("./pages/Profile"));
const Recharge = lazy(() => import("./pages/Recharge"));
const Payment = lazy(() => import("./pages/Payment"));
const Withdraw = lazy(() => import("./pages/Withdraw"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const Support = lazy(() => import("./pages/Support"));
const Telegram = lazy(() => import("./pages/Telegram"));
const Records = lazy(() => import("./pages/Records"));
const BankDetails = lazy(() => import("./pages/BankDetails"));
const About = lazy(() => import("./pages/About"));
const ExtraReferralBonus = lazy(() => import("./pages/ExtraReferralBonus"));
const ActivePlans = lazy(() => import("./pages/ActivePlans"));
const Earnings = lazy(() => import("./pages/Earnings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const TeamMembers = lazy(() => import("./pages/TeamMembers"));
const BecomePromoter = lazy(() => import("./pages/BecomePromoter"));
const ContactSupport = lazy(() => import("./pages/ContactSupport"));

// ===== Admin (always lazy — never shipped to normal users' first load) =====
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminRecharges = lazy(() => import("./pages/admin/AdminRecharges"));
const AdminWithdrawals = lazy(() => import("./pages/admin/AdminWithdrawals"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminReferrals = lazy(() => import("./pages/admin/AdminReferrals"));
const AdminRewards = lazy(() => import("./pages/admin/AdminRewards"));
const AdminCheckins = lazy(() => import("./pages/admin/AdminCheckins"));
const AdminLeaderboard = lazy(() => import("./pages/admin/AdminLeaderboard"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminPromoters = lazy(() => import("./pages/admin/AdminPromoters"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const PageFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary/25 border-t-primary" />
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />

          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* ================= PUBLIC ROUTES ================= */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* ================= USER PROTECTED ROUTES ================= */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/security" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
                <Route path="/extra-bonus" element={<ProtectedRoute><ExtraReferralBonus /></ProtectedRoute>} />
                <Route path="/recharge" element={<ProtectedRoute><Recharge /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
                <Route path="/bonus" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />
                <Route path="/telegram" element={<ProtectedRoute><Telegram /></ProtectedRoute>} />
                <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
                <Route path="/bank-details" element={<ProtectedRoute><BankDetails /></ProtectedRoute>} />
                <Route path="/become-promoter" element={<ProtectedRoute><BecomePromoter /></ProtectedRoute>} />
                <Route path="/team-members" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/active-plans" element={<ProtectedRoute><ActivePlans /></ProtectedRoute>} />
                <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />

                {/* ================= ADMIN PROTECTED ROUTES ================= */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/recharges" element={<ProtectedRoute requireAdmin><AdminRecharges /></ProtectedRoute>} />
                <Route path="/admin/withdrawals" element={<ProtectedRoute requireAdmin><AdminWithdrawals /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/transactions" element={<ProtectedRoute requireAdmin><AdminTransactions /></ProtectedRoute>} />
                <Route path="/admin/referrals" element={<ProtectedRoute requireAdmin><AdminReferrals /></ProtectedRoute>} />
                <Route path="/admin/rewards" element={<ProtectedRoute requireAdmin><AdminRewards /></ProtectedRoute>} />
                <Route path="/admin/checkins" element={<ProtectedRoute requireAdmin><AdminCheckins /></ProtectedRoute>} />
                <Route path="/admin/leaderboard" element={<ProtectedRoute requireAdmin><AdminLeaderboard /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/security" element={<ProtectedRoute requireAdmin><AdminSecurity /></ProtectedRoute>} />
                <Route path="/admin/promoters" element={<ProtectedRoute requireAdmin><AdminPromoters /></ProtectedRoute>} />

                {/* ================= 404 ================= */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
