import React from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.15)',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        boxShadow: `0 8px 32px 0 ${glowColor}`,
      }}
      className={`
        relative group overflow-hidden rounded-2xl
        bg-slate-900/60 dark:bg-slate-900/80 light:bg-white/80
        backdrop-blur-xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80
        transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/20
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
