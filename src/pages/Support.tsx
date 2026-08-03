import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Send, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Agent identity pool ── */
const AGENT_NAMES = [
  'Priya Sharma', 'Riya Singh', 'Ankit Verma', 'Neha Patel',
  'Kavya Nair', 'Arjun Mehta', 'Sneha Gupta', 'Rahul Kumar',
  'Pooja Iyer', 'Vikram Das', 'Anjali Tiwari', 'Rohan Joshi',
  'Meera Pillai', 'Siddharth Rao', 'Divya Menon', 'Kunal Sinha',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Chatbot reply engine ── */
const REPLIES: { match: RegExp; responses: string[] }[] = [
  {
    match: /\b(hi|hello|hey|hii|helo|namaste)\b/i,
    responses: [
      "Hello! How can I help you today?",
      "Hey there! Welcome to Havmor Support. What can I do for you?",
      "Hi! Good to see you here. How can I assist you today?",
    ],
  },
  {
    match: /\b(recharge|add money|topup|top up|deposit|fund)\b/i,
    responses: [
      "Sure! To recharge your wallet, go to the Recharge section from the home screen. Enter your amount, scan the QR code, pay via any UPI app (GPay, PhonePe, Paytm), and then submit your UTR number. Your wallet will be credited within a few minutes.",
      "Recharging is super easy! Tap Recharge → choose amount → scan QR → pay → enter your UTR. Done! Usually credited in 5–10 minutes. Let me know if you face any issue.",
    ],
  },
  {
    match: /\b(withdraw|withdrawal|payout|cashout|cash out)\b/i,
    responses: [
      "Withdrawals are processed within 24 hours of submission. Minimum withdrawal amount is ₹180. Make sure your bank details are updated in your profile before requesting.",
      "To withdraw, go to Profile → Withdraw. Enter your amount and submit. Our team processes it within 24 hours. Please ensure your bank account is linked!",
    ],
  },
  {
    match: /\b(invest|investment|product|plan|buy plan)\b/i,
    responses: [
      "Great choice! Browse our products page to see all available investment plans. Each plan shows daily income, total revenue, and duration. Tap 'Invest' to get started!",
      "We have some exciting investment plans with daily returns! Go to the Products tab to see all plans. Choose one that fits your budget and start earning daily income.",
    ],
  },
  {
    match: /\b(refer|referral|invite|friend|link)\b/i,
    responses: [
      "Our referral program is awesome! You earn ₹6 for every friend who joins using your referral code. Share your code from the Promotion tab. The more friends you invite, the more you earn!",
      "You can find your referral code in the Promotion section. Each successful referral gives you ₹6 bonus added directly to your wallet. Start sharing now!",
    ],
  },
  {
    match: /\b(checkin|check.in|daily bonus|bonus|attendance)\b/i,
    responses: [
      "Daily check-in gives you ₹12 bonus every day! Just go to Profile → Daily Check-In and tap the button. Don't miss a day — it's free money!",
      "You get ₹12 free every day just for checking in! Head to the Check-In section in your profile. Make it a daily habit!",
    ],
  },
  {
    match: /\b(utr|ref no|reference|transaction id|txn)\b/i,
    responses: [
      "Your UTR (Unique Transaction Reference) is a 12-digit number provided by your UPI app after payment. You can find it in your bank's payment history or in the UPI app under 'Transaction Details'.",
      "After paying, open your UPI app (GPay/PhonePe/Paytm), go to transaction history, and you'll find the UTR/Reference number there. It's usually 12 digits. Enter that on the payment page!",
    ],
  },
  {
    match: /\b(balance|wallet|account)\b/i,
    responses: [
      "Your wallet balance is shown on the Home screen and Profile page. It updates automatically after each recharge or daily income credit.",
      "You can check your balance on the Home screen. Daily income from your investments is credited automatically every day!",
    ],
  },
  {
    match: /\b(income|earning|daily|profit|return)\b/i,
    responses: [
      "Daily income from your investment plan is credited to your wallet automatically every day! You can track all earnings in Profile → Income Record.",
      "Your daily returns depend on the plan you've invested in. Check the Income Record section in your profile to see all your earnings history.",
    ],
  },
  {
    match: /\b(password|forgot|login|sign in|account|register)\b/i,
    responses: [
      "If you're having trouble logging in, make sure your phone number and password are correct. If you've forgotten your password, please contact us so we can help reset it.",
      "Login issues can happen sometimes! Double-check your registered phone number and password. For password reset, our team can help you directly.",
    ],
  },
  {
    match: /\b(thank|thanks|thank you|thx|thnx)\b/i,
    responses: [
      "You're welcome! Happy to help. Is there anything else I can assist you with?",
      "Glad I could help! Feel free to reach out anytime. Have a great day!",
      "Anytime! Don't hesitate to ask if you have more questions.",
    ],
  },
  {
    match: /\b(ok|okay|alright|got it|understood|sure)\b/i,
    responses: [
      "Great! Let me know if you need anything else.",
      "Perfect! Is there anything else I can help you with?",
      "Awesome! Feel free to ask if you have more questions.",
    ],
  },
  {
    match: /\b(problem|issue|error|not working|broken|stuck|fail)\b/i,
    responses: [
      "I'm sorry to hear that! Please describe the issue in detail and I'll do my best to help you resolve it right away.",
      "Oh no, that doesn't sound right! Can you tell me more about what's happening? I want to make sure this gets fixed for you.",
    ],
  },
  {
    match: /\b(how|what|when|where|why|which|who)\b/i,
    responses: [
      "That's a great question! Let me help you with that. Could you give me a bit more detail so I can give you the most accurate answer?",
      "I'd love to help with that! Can you share a little more context so I can guide you properly?",
    ],
  },
];

const FALLBACK_REPLIES = [
  "Thanks for reaching out! I want to make sure I understand your concern correctly. Could you provide a bit more detail?",
  "I hear you! Let me look into this for you. Can you describe what you need help with?",
  "Got it! I'm here to help. Could you elaborate a little so I can give you the best solution?",
  "Sure! I'll do my best to assist. Please tell me more about your question or issue.",
  "Thanks for contacting Havmor Support! I want to help you with this. Could you share more details?",
];

const TYPING_DELAYS = [1200, 1600, 2000, 2400]; // ms

function getBotReply(text: string): string {
  const normalized = text.trim().toLowerCase();
  for (const rule of REPLIES) {
    if (rule.match.test(normalized)) {
      return pickRandom(rule.responses);
    }
  }
  return pickRandom(FALLBACK_REPLIES);
}

/* ── Types ── */
interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
  time: string;
}

function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/* ── Component ── */
const Support = () => {
  const navigate = useNavigate();

  // Unique agent per session
  const agent = useMemo(() => ({
    name: pickRandom(AGENT_NAMES),
  }), []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      from: 'bot',
      text: `Hi there! I'm ${agent.name} from Havmor Support. How can I help you today?`,
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      text,
      time: nowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = pickRandom(TYPING_DELAYS);
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: 'bot',
        text: getBotReply(text),
        time: nowTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen max-w-lg mx-auto"
      style={{ fontFamily: "'Poppins', sans-serif", background: '#F7F2EE' }}
    >
      {/* ── Header ── */}
      <div
        className="clay-header px-4 pt-12 pb-4 flex items-center gap-3 shrink-0"
        style={{ zIndex: 10 }}
      >
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.18)' }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Agent info */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.22)' }}
        >
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-[15px] leading-tight truncate">{agent.name}</p>
          <p className="text-white/70 text-[11px]">Havmor Support • Online</p>
        </div>

        {/* Online dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" style={{ boxShadow: '0 0 6px #4ade80' }} />
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ paddingBottom: '80px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
          >
            {/* Bot avatar */}
            {msg.from === 'bot' && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-0.5"
                style={{ background: 'linear-gradient(135deg,#FF8A00,#FF6A00)' }}
              >
                <Headphones className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'} max-w-[78%]`}>
              {msg.from === 'bot' && (
                <p className="text-[10px] font-semibold mb-1 px-1" style={{ color: '#FF6A00' }}>
                  {agent.name}
                </p>
              )}
              <div
                className="px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed"
                style={
                  msg.from === 'user'
                    ? {
                        background: 'linear-gradient(135deg,#FF8A00,#FF6A00)',
                        color: '#fff',
                        borderBottomRightRadius: 6,
                        boxShadow: '0 4px 12px rgba(255,106,0,0.30)',
                      }
                    : {
                        background: '#fff',
                        color: '#2B2B2B',
                        borderBottomLeftRadius: 6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                      }
                }
              >
                {msg.text}
              </div>
              <p className="text-[10px] mt-1 px-1" style={{ color: '#AAAAAA' }}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#FF8A00,#FF6A00)' }}
            >
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <p className="text-[10px] font-semibold mb-1 px-1" style={{ color: '#FF6A00' }}>
                {agent.name}
              </p>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                style={{
                  background: '#fff',
                  borderBottomLeftRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: '#FF6A00',
                      animationDelay: `${i * 0.18}s`,
                      animationDuration: '0.9s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-3"
        style={{
          background: 'rgba(247,242,238,0.96)',
          backdropFilter: 'blur(0px)',
          borderTop: '1px solid rgba(255,106,0,0.10)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            maxLength={300}
            className="flex-1 h-12 px-4 rounded-full text-[14px] outline-none"
            style={{
              background: '#fff',
              border: '1.5px solid rgba(255,106,0,0.20)',
              color: '#2B2B2B',
              fontFamily: "'Poppins', sans-serif",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg,#FF8A00,#FF6A00)',
              boxShadow: '0 4px 14px rgba(255,106,0,0.40)',
            }}
          >
            <Send className="w-5 h-5 text-white" style={{ marginLeft: 2 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
