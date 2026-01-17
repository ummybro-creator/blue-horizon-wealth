import { Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUser } from '@/data/mockData';
import { toast } from 'sonner';

export function ReferralCard() {
  const referralLink = `https://invest.app/ref/${mockUser.referralCode}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Investment App',
          text: `Join now and start earning daily income! Use my referral code: ${mockUser.referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        copyToClipboard(referralLink, 'Referral link');
      }
    } else {
      copyToClipboard(referralLink, 'Referral link');
    }
  };

  return (
    <div className="mx-4 -mt-16 relative z-10 animate-slide-up">
      <div className="bg-card rounded-2xl shadow-elevated p-5">
        <h3 className="font-semibold text-foreground mb-4">Invite Friends & Earn</h3>
        
        {/* Referral Code */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-xl px-4 py-3 font-mono text-lg font-bold text-primary tracking-wider">
              {mockUser.referralCode}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(mockUser.referralCode, 'Referral code')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Your Referral Link</p>
          <div className="bg-secondary rounded-xl px-4 py-3 text-sm text-muted-foreground truncate">
            {referralLink}
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-primary/5 rounded-xl p-3 mb-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Level 1 Commission</p>
              <p className="font-bold text-primary">5%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Level 2 Commission</p>
              <p className="font-bold text-primary">2%</p>
            </div>
          </div>
        </div>

        <Button variant="gradient" className="w-full" onClick={shareReferral}>
          <Share2 className="w-4 h-4" />
          Share & Invite
        </Button>
      </div>
    </div>
  );
}
