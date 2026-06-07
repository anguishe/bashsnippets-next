interface AffiliateBoxProps {
  partner: 'digitalocean' | 'namecheap';
  headline?: string;
  className?: string;
}

function CloudIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#58a6ff"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#58a6ff"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const partners = {
  digitalocean: {
    Icon: CloudIcon,
    headline: 'Run this script on a real Linux server',
    subline: 'Get $200 free credit — DigitalOcean',
    href: 'https://m.do.co/c/7a196437764c',
    label: 'Get $200 Free →',
  },
  namecheap: {
    Icon: GlobeIcon,
    headline: 'Need a domain for your next project?',
    subline: 'Register with Namecheap — free WHOIS privacy included',
    href: 'https://namecheap.pxf.io/c/7260430/1632743/5618',
    label: 'Check Domain Prices →',
  },
} as const;

export default function AffiliateBox({ partner, headline, className = '' }: AffiliateBoxProps) {
  const config = partners[partner];
  const Icon = config.Icon;

  return (
    <div
      className={`my-10 rounded-lg border border-border border-l-[3px] border-l-[#58a6ff] bg-bg2 px-6 py-5 ${className}`.trim()}
    >
      <div className="flex flex-wrap items-start gap-4">
        <span className="shrink-0">
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-bold text-text">
            {headline ?? config.headline}
          </p>
          <p className="mt-1 text-sm text-muted">{config.subline}</p>
          <a
            href={config.href}
            target="_blank"
            rel="noopener sponsored"
            className="mt-4 inline-block rounded-md bg-green px-4 py-2 font-heading text-sm font-bold text-bg no-underline transition-colors hover:bg-[#2ea043]"
          >
            {config.label}
          </a>
          <p className="mt-3 text-[11px] italic text-muted">
            Affiliate link · we earn a commission
          </p>
        </div>
      </div>
    </div>
  );
}
