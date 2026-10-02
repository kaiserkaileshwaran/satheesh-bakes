import { UserAvatar } from '../types';

const AVATAR_COLORS = [
  '#6F4E37', // Bakery Brown
  '#3E2723', // Dark Chocolate
  '#D4A017', // Golden Accent
  '#F4A261', // Warm Orange
  '#8B654B', // Light Brown
  '#9C6644', // Terracotta
  '#7F5539', // Cinnamon
  '#B08968', // Latte
];

export function generateInitials(name: string): string {
  if (!name || name.trim().length === 0) return 'SB';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function createDefaultAvatar(name: string): UserAvatar {
  const initials = generateInitials(name);
  // Pick deterministic color based on name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;

  return {
    text: initials,
    background: AVATAR_COLORS[colorIndex],
    textColor: '#FFFFFF',
    shape: 'circle',
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number | string): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
