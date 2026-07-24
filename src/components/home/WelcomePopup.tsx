import { X } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ORANGE      = '#F5821F';
const ORANGE_DARK = '#E8600F';
const FONT        = "'Poppins', sans-serif";

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleTelegram = () => {
    window.open('https://t.me/+wakuiooJ5s9iOWJl', '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(20,8,0,0.60)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 8px 24px rgba(242,90,0,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Close button ── */}
        <button
          onClick={handleClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: 0,
          }}
        >
          <X size={22} color={ORANGE} strokeWidth={2.5} />
        </button>

        {/* ── Content ── */}
        <div style={{ padding: '28px 24px 24px' }}>

          {/* Title */}
          <h2 style={{
            textAlign: 'center',
            fontSize: 17,
            fontWeight: 800,
            color: '#1A1A1A',
            margin: '0 0 10px',
            letterSpacing: 0.3,
            fontFamily: FONT,
            lineHeight: 1.3,
          }}>
            🚨 IMPORTANT NOTICE 🚨
          </h2>

          {/* Orange divider */}
          <div style={{
            height: 2.5,
            background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)`,
            borderRadius: 2,
            marginBottom: 18,
          }} />

          {/* Notice rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <Row>
              <span>🎉</span>
              <span>
                Welcome to{' '}
                <span style={{ color: ORANGE, fontWeight: 700 }}>Havmor Official Platform</span>!
              </span>
            </Row>

            <Row>
              <span>🌟</span>
              <span>
                <strong>Launch Bonus:</strong> All new users will receive an instant{' '}
                <span style={{ color: ORANGE, fontWeight: 700 }}>₹12 Check-in Reward</span>.
              </span>
            </Row>

            <Row>
              <span>📅</span>
              <span>
                Launch Date:{' '}
                <span style={{ color: ORANGE, fontWeight: 700 }}>25th July 2026</span>
              </span>
            </Row>

            <Row>
              <span>🤩</span>
              <span>
                Every refer Each:{' '}
                <span style={{ color: ORANGE, fontWeight: 700 }}>₹6</span>
              </span>
            </Row>

            <Row>
              <span>💰</span>
              <span>
                <strong>Minimum Recharge:</strong>{' '}
                <span style={{ color: ORANGE, fontWeight: 700 }}>₹298</span>
              </span>
            </Row>

            <Row>
              <span>🏦</span>
              <span>
                <strong>Minimum Withdrawal:</strong>{' '}
                <span style={{ color: ORANGE, fontWeight: 700 }}>180.00rs</span>
              </span>
            </Row>

            <Row>
              <span>🎯</span>
              <span>
                Start earning today and enjoy exclusive early access benefits!
              </span>
            </Row>

          </div>

          {/* Join Telegram button */}
          <button
            onClick={handleTelegram}
            style={{
              marginTop: 22,
              width: '100%',
              height: 54,
              borderRadius: 14,
              border: 'none',
              background: `linear-gradient(180deg, #FF9A2E 0%, ${ORANGE} 55%, ${ORANGE_DARK} 100%)`,
              color: '#fff',
              fontWeight: 700,
              fontSize: 17,
              fontFamily: FONT,
              cursor: 'pointer',
              boxShadow: `0 8px 22px rgba(245,130,30,0.50), 0 0 32px rgba(247,147,30,0.28)`,
              transition: 'transform 0.1s',
              letterSpacing: 0.2,
            }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            onTouchStart={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
            onTouchEnd={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            Join Telegram
          </button>

        </div>
      </div>
    </div>
  );
}

/* ── Helper: single notice row ───────────────────────────────────────── */
function Row({ children }: { children: [React.ReactNode, React.ReactNode] }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      fontSize: 14,
      color: '#2B2B2B',
      fontFamily: "'Poppins', sans-serif",
      lineHeight: 1.5,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{children[0]}</span>
      <span style={{ flex: 1 }}>{children[1]}</span>
    </div>
  );
}
