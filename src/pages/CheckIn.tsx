import { useState } from 'react';
import { ArrowLeft, Gift, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const rewards = [10, 15, 20, 25, 30, 40, 50];

const CheckIn = () => {
  const navigate = useNavigate();
  const [checkedDays, setCheckedDays] = useState([0, 1, 2]); // Days already checked in
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const currentDay = 3; // Thursday (0-indexed)

  const handleCheckIn = () => {
    if (!todayCheckedIn) {
      setTodayCheckedIn(true);
      setCheckedDays([...checkedDays, currentDay]);
      toast.success(`You earned ₹${rewards[currentDay]}!`, {
        description: 'Check-in bonus added to your wallet',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-header pt-12 pb-24 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Daily Check-in</h1>
        </div>
        <div className="text-center">
          <Gift className="w-16 h-16 text-primary-foreground mx-auto mb-2" />
          <p className="text-primary-foreground/70">Check in daily to earn bonus rewards!</p>
        </div>
      </div>

      <div className="px-4 -mt-12">
        {/* Check-in Grid */}
        <div className="bg-card rounded-2xl shadow-elevated p-5 animate-slide-up">
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDays.map((day, index) => {
              const isChecked = checkedDays.includes(index);
              const isCurrent = index === currentDay;
              const isPast = index < currentDay;
              
              return (
                <div key={day} className="text-center">
                  <div className={cn(
                    "w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 transition-all duration-300",
                    isChecked && "gradient-primary",
                    isCurrent && !isChecked && "border-2 border-primary border-dashed",
                    !isChecked && !isCurrent && (isPast ? "bg-destructive/10" : "bg-secondary")
                  )}>
                    {isChecked ? (
                      <Check className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <span className={cn(
                        "text-xs font-bold",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}>
                        ₹{rewards[index]}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs",
                    isCurrent ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Streak Info */}
          <div className="bg-primary/5 rounded-xl p-4 mb-5 text-center">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold text-primary">{checkedDays.length} Days</p>
            <p className="text-xs text-muted-foreground mt-1">
              7-day streak bonus: ₹100
            </p>
          </div>

          {/* Check-in Button */}
          <Button 
            variant="gradient" 
            size="xl" 
            className="w-full"
            onClick={handleCheckIn}
            disabled={todayCheckedIn}
          >
            {todayCheckedIn ? (
              <>
                <Check className="w-5 h-5" />
                Checked In Today
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                Check In Now (+₹{rewards[currentDay]})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
