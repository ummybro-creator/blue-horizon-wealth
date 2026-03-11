import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Target, Eye, ShieldCheck, Users, HeadphonesIcon, Coins, Network, UserCog, BarChart3, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: Coins, title: 'Daily Earning Opportunities', desc: 'Explore plans and earn rewards every day.' },
  { icon: Network, title: 'Referral Network System', desc: 'Grow your team and unlock bonuses.' },
  { icon: UserCog, title: 'Easy Account Management', desc: 'Simple dashboard to manage everything.' },
  { icon: BarChart3, title: 'Transparent Reward Tracking', desc: 'Track your income and progress in real time.' },
];

const whyChoose = [
  'Secure system',
  'Transparent structure',
  'User-friendly interface',
  'Continuous platform improvements',
];

const About = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-10 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-card shadow-card">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">About Our Company</h1>
            <p className="text-xs text-muted-foreground">Building a reliable digital earning platform</p>
          </div>
        </div>

        {/* Mission */}
        <Section icon={Target} title="Our Mission">
          Our platform was created to provide users with simple and accessible digital earning opportunities. We focus on building a system where users can explore different plans, track their progress, and earn rewards through participation and community growth.
        </Section>

        {/* What We Offer */}
        <div className="space-y-3">
          <SectionHeader icon={Coins} title="What We Offer" />
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.title} className="bg-card rounded-2xl p-4 shadow-card flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground leading-tight">{f.title}</span>
                <span className="text-xs text-muted-foreground leading-snug">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vision */}
        <Section icon={Eye} title="Our Vision">
          Our vision is to create a long-term digital platform that supports user growth, financial awareness, and community collaboration. We continuously improve our technology to provide a smooth and reliable user experience.
        </Section>

        {/* Why Choose */}
        <div className="space-y-3">
          <SectionHeader icon={ShieldCheck} title="Why Choose Our Platform" />
          <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
            {whyChoose.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Community */}
        <Section icon={Users} title="Community Growth">
          We believe that strong communities build stronger platforms. Our referral system allows users to invite friends, grow their network, and unlock additional rewards.
        </Section>

        {/* Support */}
        <Section icon={HeadphonesIcon} title="Support & Reliability">
          Our team works continuously to maintain a stable and secure environment for users. We focus on improving performance, reliability, and overall platform experience.
        </Section>

        {/* CTA */}
        <div className="gradient-primary rounded-2xl p-6 text-center shadow-elevated">
          <p className="text-primary-foreground font-semibold text-base leading-relaxed">
            Join our platform today and start your digital earning journey.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <SectionHeader icon={icon} title={title} />
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export default About;
