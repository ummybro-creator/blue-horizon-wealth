import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// ================= USER PAGES =================
import Index from "./pages/Index";
import Products from "./pages/Products";
import Team from "./pages/Team";
import Profile from "./pages/Profile";
import Recharge from "./pages/Recharge";
import Payment from "./pages/Payment";
import Withdraw from "./pages/Withdraw";
import CheckIn from "./pages/CheckIn";
import Support from "./pages/Support";
import Telegram from "./pages/Telegram";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Records from "./pages/Records";
import BankDetails from "./pages/BankDetails";
import About from "./pages/About";
import ExtraReferralBonus from "./pages/ExtraReferralBonus";
import ActivePlans from "./pages/ActivePlans";
import Earnings from "./pages/Earnings";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";

// ================= ADMIN PAGES =================
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRecharges from "./pages/admin/AdminRecharges";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminRewards from "./pages/admin/AdminRewards";
import AdminCheckins from "./pages/admin/AdminCheckins";
import AdminLeaderboard from "./pages/admin/AdminLeaderboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminSecurity from "./pages/admin/AdminSecurity";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />

          <BrowserRouter>
            <Routes>
              {/* ================= PUBLIC ROUTES ================= */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ================= USER PROTECTED ROUTES ================= */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <Team />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/extra-bonus"
                element={
                  <ProtectedRoute>
                    <ExtraReferralBonus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recharge"
                element={
                  <ProtectedRoute>
                    <Recharge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/withdraw"
                element={
                  <ProtectedRoute>
                    <Withdraw />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkin"
                element={
                  <ProtectedRoute>
                    <CheckIn />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bonus"
                element={
                  <ProtectedRoute>
                    <CheckIn />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <Support />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/telegram"
                element={
                  <ProtectedRoute>
                    <Telegram />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/records"
                element={
                  <ProtectedRoute>
                    <Records />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bank-details"
                element={
                  <ProtectedRoute>
                    <BankDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* ================= ADMIN PROTECTED ROUTES ================= */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/recharges"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminRecharges />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/withdrawals"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminWithdrawals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute requireAdmin><AdminTransactions /></ProtectedRoute>} />
              <Route path="/admin/referrals" element={<ProtectedRoute requireAdmin><AdminReferrals /></ProtectedRoute>} />
              <Route path="/admin/rewards" element={<ProtectedRoute requireAdmin><AdminRewards /></ProtectedRoute>} />
              <Route path="/admin/checkins" element={<ProtectedRoute requireAdmin><AdminCheckins /></ProtectedRoute>} />
              <Route path="/admin/leaderboard" element={<ProtectedRoute requireAdmin><AdminLeaderboard /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>} />
              <Route path="/admin/security" element={<ProtectedRoute requireAdmin><AdminSecurity /></ProtectedRoute>} />

              {/* ================= 404 ================= */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
