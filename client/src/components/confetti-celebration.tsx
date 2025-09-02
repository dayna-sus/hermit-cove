import { useEffect, useState } from "react";

interface ConfettiCelebrationProps {
  isActive: boolean;
  duration?: number;
}

interface ConfettiPiece {
  id: number;
  color: string;
  left: number;
  delay: number;
}

export default function ConfettiCelebration({ 
  isActive, 
  duration = 3000 
}: ConfettiCelebrationProps) {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const colors = [
    '#f39c12', // Orange
    '#e74c3c', // Red
    '#9b59b6', // Purple
    '#3498db', // Blue
    '#2ecc71', // Green
    '#f1c40f', // Yellow
    '#e67e22', // Dark Orange
    '#1abc9c', // Teal
    '#34495e'  // Dark Blue
  ];

  useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          left: Math.random() * 100,
          delay: Math.random() * 2
        });
      }
      setConfettiPieces(pieces);

      // Clear confetti after duration
      const timeout = setTimeout(() => {
        setConfettiPieces([]);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [isActive, duration]);

  if (!isActive || confettiPieces.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50" data-testid="confetti-container">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti absolute"
          style={{
            backgroundColor: piece.color,
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            top: '-10px'
          }}
          data-testid={`confetti-piece-${piece.id}`}
        />
      ))}
    </div>
  );
}
