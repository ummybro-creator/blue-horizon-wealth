import { FileText } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    date: '14',
    month: 'JAN',
    title: 'Tata Salt launches "Immuni+" variant fortified with zinc and iodine to support immunity, available across major retail chains.',
  },
  {
    id: 2,
    date: '12',
    month: 'JAN',
    title: 'New investment plans launched with higher daily returns for VIP members.',
  },
];

export function LatestNews() {
  return (
    <div className="mx-4 mt-4 mb-6">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-primary">Latest News</h2>
        </div>
        
        <div className="space-y-4">
          {newsItems.map((news) => (
            <div key={news.id} className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-14 rounded-lg bg-primary flex flex-col items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg leading-none">{news.date}</span>
                <span className="text-primary-foreground/80 text-xs">{news.month}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {news.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
