import { ArrowLeft, MessageCircle, Phone, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();

  const supportOptions = [
    {
      icon: MessageCircle,
      label: 'WhatsApp Support',
      description: 'Chat with us on WhatsApp',
      action: () => window.open('https://wa.me/919876543210', '_blank'),
      color: 'bg-success/10 text-success',
    },
    {
      icon: Mail,
      label: 'Email Support',
      description: 'support@investapp.com',
      action: () => window.open('mailto:support@investapp.com', '_blank'),
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Phone,
      label: 'Phone Support',
      description: '+91 98765 43210',
      action: () => window.open('tel:+919876543210', '_blank'),
      color: 'bg-accent/10 text-accent',
    },
  ];

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-header pt-12 pb-6 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Customer Support</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {supportOptions.map((option, index) => (
          <button
            key={option.label}
            onClick={option.action}
            className="w-full bg-card rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-elevated transition-all animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center`}>
              <option.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">{option.label}</p>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}

        {/* FAQ Section */}
        <div className="bg-card rounded-2xl shadow-card p-5 mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              'How to recharge my wallet?',
              'How long does withdrawal take?',
              'How does daily income work?',
              'How to invite friends?',
            ].map((faq, index) => (
              <button
                key={index}
                className="w-full text-left p-3 bg-secondary/50 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {faq}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
