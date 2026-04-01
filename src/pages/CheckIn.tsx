import { ArrowLeft, Gift, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCheckins, useTodayCheckin, useCreateCheckin } from '@/hooks/useCheckins';
import { useAppSettings } from '@/hooks/useAppSettings';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayRewards = [5, 7, 9, 10, 12, 15, 20];

const CheckIn = () => {
  const navigate = useNavigate();
  const { data: checkins = [] } = useCheckins();
  const { data: todayCheckin } = useTodayCheckin();
  const { data: settings } = useAppSettings();
  const createCheckin = useCreateCheckin();

  const bonusAmount = settings?.checkin_bonus_amount || 12;
  
  const today = new Date();
  const dayIndex = today.getDay();
  const currentDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  
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
      await createCheckin.mutateAsync({ bonusAmount: dayRewards[currentDayIndex] || bonusAmount });
      toast.success(`You earned ₹${dayRewards[currentDayIndex] || bonusAmount}!`, {
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
    <div className="min-h-screen max-w-lg mx-auto app-bg">
      {/* Header */}
      <div className="clay-header pt-12 pb-24 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Daily Check-in</h1>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mx-auto mb-2 flex items-center justify-center shadow-clay-sm">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/80 text-sm">Check in daily to earn bonus! Weekly total: ₹78</p>
        </div>
      </div>

      <div className="px-4 -mt-12">
        <div className="clay-card-lg p-5 animate-slide-up">
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDays.map((day, index) => {
              const isChecked = checkedDays.includes(index);
              const isCurrent = index === currentDayIndex;
              const isPast = index < currentDayIndex;
              
              return (
                <div key={day} className="text-center">
                  <div className={cn(
                    "w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1 transition-all duration-300",
                    isChecked && "clay-button",
                    isCurrent && !isChecked && "border-2 border-primary border-dashed bg-primary/5",
                    !isChecked && !isCurrent && (isPast ? "bg-destructive/10 shadow-clay-sm" : "clay-inset")
                  )}>
                    {isChecked ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span className={cn(
                        "text-[10px] font-bold",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}>
                        ₹{dayRewards[index]}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px]",
                    isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Streak */}
          <div className="clay-inset p-4 mb-5 text-center">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-2xl font-extrabold text-primary">{checkedDays.length} Days</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total earned: ₹{checkedDays.reduce((sum, d) => sum + (dayRewards[d] || bonusAmount), 0)}
            </p>
          </div>

          {/* Button */}
          <button 
            className="w-full clay-button py-3.5 text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
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
                Check In Now (+₹{dayRewards[currentDayIndex]})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
