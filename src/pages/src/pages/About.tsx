import { AppLayout } from '@/components/layout/AppLayout';

const About = () => {
  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          About Company
        </h1>

        <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <p className="text-muted-foreground">
            Welcome to Tea Tata Official Platform.
          </p>

          <p className="text-muted-foreground">
            Our platform provides users an opportunity to earn by completing
            simple daily tasks and building a strong referral team.
          </p>

          <p className="text-muted-foreground">
            We are committed to transparency, fast support, and timely payouts.
          </p>

          <p className="text-muted-foreground">
            Thank you for being a part of our journey.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default About;
