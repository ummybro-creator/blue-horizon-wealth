import { User, TrendingUp } from 'lucide-react';
import { mockTeamMembers } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function TeamMemberList() {
  return (
    <div className="mx-4 mt-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-lg font-semibold text-foreground mb-3">Team Members</h3>
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {mockTeamMembers.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No team members yet</p>
            <p className="text-sm text-muted-foreground">Share your referral link to grow your team</p>
          </div>
        ) : (
          mockTeamMembers.map((member, index) => (
            <div
              key={member.id}
              className={cn(
                "flex items-center gap-3 p-4",
                index !== mockTeamMembers.length - 1 && "border-b border-border"
              )}
            >
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  {member.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{member.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    Level {member.level}
                  </span>
                  <span>{member.mobile}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  ₹{member.commission}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.joinedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
