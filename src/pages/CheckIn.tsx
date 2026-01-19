import { ArrowLeft, Gift, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCheckins, useTodayCheckin, useCreateCheckin } from '@/hooks/useCheckins';
import { useAppSettings } from '@/hooks/useAppSettings';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CheckIn = () => {
  const navigate = useNavigate();
  const { data: checkins = [] } = useCheckins();
  const { data: todayCheckin } = useTodayCheckin();
  const { data: settings } = useAppSettings();
  const createCheckin = useCreateCheckin();

  // Get bonus amount from settings (max ₹12 as per rules)
  const bonusAmount = settings?.checkin_bonus_amount || 12;
  
  // Get current day index (0 = Monday, 6 = Sunday)
  const today = new Date();
  const dayIndex = today.getDay();
  const currentDayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert Sunday=0 to Monday=0 based
  
  // Get checked days this week
  const getCheckedDaysThisWeek = () => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDayIndex);
    weekStart.setHours(0, 0, 0, 0);
    
    return checkins
      .filter(c => new Date(c.checked_in_at) >= weekStart)
      .map(c => {
        const date = new Date(c.checked_in_at);
        const day = date.getDay();
        return day === 0 ? 6 : day - 1;
      });
  };
  
  const checkedDays = getCheckedDaysThisWeek();
  const todayCheckedIn = !!todayCheckin;

  const handleCheckIn = async () => {
    if (todayCheckedIn) return;
    
    try {
      await createCheckin.mutateAsync({ bonusAmount });
      toast.success(`You earned ₹${bonusAmount}!`, {
        description: 'Check-in bonus added to your wallet',
      });
    } catch (error: any) {
      if (error.message === 'Already checked in today') {
        toast.error('Already checked in today!');
      } else {
        toast.error('Failed to check in. Please try again.');
      }
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
          <p className="text-primary-foreground/70">Check in daily to earn ₹{bonusAmount} bonus!</p>
        </div>
      </div>

      <div className="px-4 -mt-12">
        {/* Check-in Grid */}
        <div className="bg-card rounded-2xl shadow-elevated p-5 animate-slide-up">
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDays.map((day, index) => {
              const isChecked = checkedDays.includes(index);
              const isCurrent = index === currentDayIndex;
              const isPast = index < currentDayIndex;
              
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
                        ₹{bonusAmount}
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
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-primary">{checkedDays.length} Days</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total earned: ₹{checkedDays.length * bonusAmount}
            </p>
          </div>

          {/* Check-in Button */}
          <Button 
            variant="gradient" 
            size="xl" 
            className="w-full"
            onClick={handleCheckIn}
            disabled={todayCheckedIn || createCheckin.isPending}
          >
            {todayCheckedIn ? (
              <>
                <Check className="w-5 h-5" />
                Checked In Today
              </>
            ) : createCheckin.isPending ? (
              'Checking in...'
            ) : (
              <>
                <Gift className="w-5 h-5" />
                Check In Now (+₹{bonusAmount})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;