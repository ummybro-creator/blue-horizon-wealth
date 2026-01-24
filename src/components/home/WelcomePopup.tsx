import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-elevated max-w-sm w-full animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-center text-xl font-bold text-foreground flex items-center justify-center gap-2">
            🧧 IMPORTANT NOTICE 🧧
          </h2>
          <div className="w-full h-px bg-primary/30 mt-3" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center space-y-3">
          <p className="text-foreground">
            🎉 Welcome to <span className="text-primary font-bold">Tata Tea Official Platform</span>!
          </p>
          
          <p className="text-foreground">
            🌟 <strong>Launch Bonus:</strong> All new users will receive an instant <span className="text-primary font-bold">₹12 Check-in Reward</span>.
          </p>
          
          <p className="text-foreground">
            📅 <strong>Launch Date:</strong> <span className="text-primary font-bold">27th Jan. 2026</span>
          </p>
          
          <p className="text-foreground">
            🥳 Every refer Each: <span className="text-primary font-bold">₹6</span>
          </p>
          
          <p className="text-foreground">
            💰 <strong>Minimum Recharge:</strong> <span className="text-primary font-bold">₹300.00rs</span>
          </p>
          
          <p className="text-foreground">
            🏧 <strong>Minimum Withdrawal:</strong> <span className="text-primary font-bold">180.00rs</span>
          </p>
          
          <p className="text-foreground">
            🎯 Start earning today and enjoy exclusive early access benefits!
          </p>

          <Button 
            variant="gradient" 
            className="w-full mt-4 h-12"
            onClick={() => window.open('https://t.me/tatateaofficial', '_blank')}
          >
            <Send className="w-5 h-5 mr-2" />
            Join Telegram
          </Button>
        </div>
      </div>
    </div>
  );
}
