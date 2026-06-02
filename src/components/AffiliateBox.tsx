interface AffiliateBoxProps {
  partner: 'digitalocean' | 'namecheap';
  className?: string;
}

const partners = {
  digitalocean: {
    border: 'border-amber',
    heading: 'Need a VPS to run these scripts?',
    body: 'DigitalOcean gives new accounts $200 free credit — enough to run a server for 4 months.',
    href: 'https://m.do.co/c/7a196437764c',
    label: 'Get $200 Free →',
    buttonClass: 'bg-amber text-bg',
  },
  namecheap: {
    border: 'border-blue',
    heading: 'Need a domain for your project?',
    body: 'Register with Namecheap — free WHOIS privacy included on all domains.',
    href: 'https://namecheap.pxf.io/c/7260430/1632743/5618',
    label: 'Check Domain Prices →',
    buttonClass: 'bg-blue text-bg',
  },
} as const;

export default function AffiliateBox({ partner, className = '' }: AffiliateBoxProps) {
  const config = partners[partner];

  return (
    <div
      className={`my-10 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-bg2 p-5 ${config.border} border ${className}`.trim()}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-1 font-heading text-sm font-bold text-text">
          {config.heading}
        </p>
        <p className="text-xs leading-relaxed text-muted">{config.body}</p>
      </div>
      <a
        href={config.href}
        target="_blank"
        rel="noopener sponsored"
        className={`${config.buttonClass} rounded px-4 py-2 font-mono text-sm font-semibold no-underline transition-opacity hover:opacity-90`}
      >
        {config.label}
      </a>
    </div>
  );
}
