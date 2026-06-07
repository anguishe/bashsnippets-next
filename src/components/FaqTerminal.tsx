export interface FaqTerminalItem {
  question: string;
  answer: string;
}

interface FaqTerminalProps {
  items: readonly FaqTerminalItem[];
  /** Title-bar label, e.g. "faq — bash" */
  label?: string;
  className?: string;
}

export default function FaqTerminal({
  items,
  label = 'faq — bash',
  className = '',
}: FaqTerminalProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <article
          key={item.question}
          className="faq-terminal-card"
          tabIndex={0}
        >
          <div className="faq-terminal-titlebar">
            <span className="faq-terminal-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="faq-terminal-label">{label}</span>
          </div>

          <div className="faq-terminal-body">
            <p className="faq-terminal-prompt">
              <span className="faq-terminal-dollar" aria-hidden="true">
                $
              </span>
              <span className="faq-terminal-question">{item.question}</span>
              <span className="faq-terminal-caret" aria-hidden="true">
                ▋
              </span>
            </p>
            <div className="faq-terminal-answer">
              <p>{item.answer}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
