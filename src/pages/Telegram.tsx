import { ArrowLeft, Send, Users, Bell, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Telegram = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: Bell, text: 'Get instant notifications' },
    { icon: Gift, text: 'Exclusive bonus offers' },
    { icon: Users, text: 'Connect with community' },
  ];

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-header pt-12 pb-32 px-4">
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Join Telegram</h1>
        </div>
        
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center mb-4">
            <Send className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground mb-2">Official Telegram Group</h2>
          <p className="text-primary-foreground/70">Join our community for updates & support</p>
        </div>
      </div>

      <div className="px-4 -mt-16">
        <div className="bg-card rounded-2xl shadow-elevated p-5 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-4">Why Join?</h3>
          
          <div className="space-y-3 mb-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-muted-foreground">Members</p>
            <p className="text-2xl font-bold text-primary">12,500+</p>
          </div>

          <Button 
            variant="gradient" 
            size="xl" 
            className="w-full"
            onClick={() => window.open('https://t.me/tatateaofficial', '_blank')}
          >
            <Send className="w-5 h-5" />
            Join Telegram Group
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Telegram;
