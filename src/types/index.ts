export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  avatar?: string;
  referralCode: string;
  referredBy?: string;
  bankDetails?: BankDetails;
  upiId?: string;
  createdAt: Date;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}

export interface Wallet {
  totalBalance: number;
  rechargeBalance: number;
  bonusBalance: number;
  totalIncome: number;
  withdrawableBalance: number;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  duration: number;
  category: 'daily' | 'vip';
  isSpecialOffer?: boolean;
  description?: string;
}

export interface Investment {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  investedAt: Date;
  expiresAt: Date;
  totalEarned: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'recharge' | 'withdraw' | 'income' | 'bonus' | 'referral';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  mobile: string;
  level: number;
  joinedAt: Date;
  totalInvestment: number;
  commission: number;
}

export interface CheckIn {
  id: string;
  userId: string;
  date: Date;
  reward: number;
  streak: number;
}
