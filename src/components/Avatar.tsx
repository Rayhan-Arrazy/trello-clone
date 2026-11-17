import { avatarGradient, initials } from '../utils';

interface AvatarProps {
  label: string;
  size?: 'xs' | 'sm' | 'md';
  ring?: boolean;
}

type AvatarSize = NonNullable<AvatarProps['size']>;

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-11 w-11 text-sm',
};

export function Avatar({ label, size = 'sm', ring = false }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      title={label}
      className={[
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm',
        SIZE_CLASSES[size],
        avatarGradient(label),
        ring ? 'ring-2 ring-ink/10' : '',
      ].join(' ')}
    >
      {initials(label)}
    </span>
  );
}
