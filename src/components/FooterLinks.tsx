import { cn } from '../lib/cn';

export interface TextLinkProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/** Button styled as an inline text link. */
export function TextLink({ className, children, ...props }: TextLinkProps) {
  return (
    <button
      type="button"
      className={cn(
        'cursor-pointer underline-offset-2 hover:text-white hover:underline',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const LINKS: { label: string; nav: string }[] = [
  { label: 'About', nav: 'About CCHAT' },
  { label: 'Community rules', nav: 'Community rules' },
  { label: 'Privacy', nav: 'Privacy' },
];

export interface FooterLinksProps {
  onNavigate?: (nav: string, handleOrTopic?: string) => void;
  current?: string;
  className?: string;
}

/** Shared footer navigation (About · Community rules · Privacy). */
export function FooterLinks({ onNavigate, current, className }: FooterLinksProps) {
  return (
    <nav aria-label="Site" className={cn('flex gap-2', className)}>
      {LINKS.map((link, i) => (
        <span key={link.nav} className="flex gap-2">
          {i > 0 && <span aria-hidden="true">·</span>}
          <TextLink
            onClick={() => onNavigate?.(link.nav)}
            aria-current={current === link.nav ? 'page' : undefined}
            className={current === link.nav ? 'text-ink-soft' : undefined}
          >
            {link.label}
          </TextLink>
        </span>
      ))}
    </nav>
  );
}
