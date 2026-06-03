'use client';

/**
 * TOOL COMPONENT TEMPLATE
 * =======================
 * 1. Copy this file to: src/components/tools/YourToolName.tsx
 * 2. Rename the default export to PascalCase matching `component` in src/lib/tools.ts
 * 3. Register the slug in src/components/tools/ToolRenderer.tsx
 * 4. Add the registry entry in src/lib/tools.ts
 *
 * Brand tokens (also available as Tailwind classes: bg-bg, text-text, border-border, etc.):
 *   --bg: #0d1117        page background
 *   --bg2: #161b22       cards, panels
 *   --bg3: #1c2128       inputs, code blocks
 *   --border: #30363d    all borders
 *   --green: #39d353     primary accent / action buttons
 *   --amber: #e3b341     warnings
 *   --blue: #58a6ff      info callouts
 *   --muted: #8b949e     labels, secondary text
 *   --text: #e6edf3      primary body text
 */

import CopyButton from '@/components/CopyButton';
import { useClipboard } from '@/components/tools/shared/useClipboard';
import { useCallback, useMemo, useState, type CSSProperties } from 'react';

// ── Types ───────────────────────────────────────────────────────
// Define shapes for your tool's input/output data
interface GeneratedOutput {
  summary: string;
  command: string;
}

// ── Pure logic (no React) ───────────────────────────────────────
// Keep generation/lookup functions outside the component for clarity and testing
function buildOutput(inputValue: string): GeneratedOutput | null {
  const trimmed = inputValue.trim();
  if (!trimmed) return null;

  return {
    summary: `Processed: ${trimmed}`,
    command: `# example output\n echo "${trimmed}"`,
  };
}

// ── Component ───────────────────────────────────────────────────
export default function YourToolName() {
  // INPUT STATE — one useState per interactive field
  const [inputValue, setInputValue] = useState('');
  const [optionEnabled, setOptionEnabled] = useState(true);

  // OUTPUT STATE — derived result and UI feedback
  const [hasGenerated, setHasGenerated] = useState(false);

  // CLIPBOARD — shared pattern across all tools
  const { copied, copy } = useClipboard();

  // DERIVED OUTPUT — recalculates when inputs change after user clicks Generate
  const output = useMemo(() => {
    if (!hasGenerated) return null;
    return buildOutput(inputValue);
  }, [hasGenerated, inputValue]);

  // ACTION HANDLER — primary button logic
  const handleGenerate = useCallback(() => {
    setHasGenerated(true);
  }, []);

  // COPY HANDLER — copies the main output string (command, crontab line, etc.)
  const handleCopy = useCallback(async () => {
    if (!output?.command) return;
    await copy(output.command);
  }, [copy, output]);

  return (
    <div
      className="rounded-lg border border-border bg-bg p-0"
      style={
        {
          // CSS custom properties — reference in inline styles or pass to child elements
          '--bg': '#0d1117',
          '--bg2': '#161b22',
          '--bg3': '#1c2128',
          '--border': '#30363d',
          '--green': '#39d353',
          '--amber': '#e3b341',
          '--blue': '#58a6ff',
          '--muted': '#8b949e',
          '--text': '#e6edf3',
        } as CSSProperties
      }
    >
      <div className="flex flex-col gap-6 md:flex-row">
        {/* ── INPUT SECTION ───────────────────────────────────── */}
        <div className="w-full shrink-0 md:w-[340px]">
          <label htmlFor="inp-main" className="mb-1.5 block font-mono text-xs text-muted">
            Input Label
          </label>
          <input
            id="inp-main"
            type="text"
            placeholder="Enter a value..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerate();
            }}
            className="w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-sm text-text outline-none focus:border-green"
          />

          <label className="mt-4 flex cursor-pointer items-center gap-2 font-mono text-xs text-muted">
            <input
              type="checkbox"
              checked={optionEnabled}
              onChange={(e) => setOptionEnabled(e.target.checked)}
              className="accent-green"
            />
            Optional setting
          </label>

          {/* ACTION BUTTON — primary green CTA */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!inputValue.trim()}
            className="mt-5 w-full rounded-lg border-none bg-green py-2.5 font-mono text-[13px] font-semibold text-[#0d1117] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate Output
          </button>
        </div>

        {/* ── OUTPUT SECTION ──────────────────────────────────── */}
        <div className="min-w-0 flex-1 md:sticky md:top-20">
          {!output && (
            <div className="rounded-lg border border-border bg-bg2 px-6 py-10 text-center text-sm text-muted">
              ← Enter a value and click Generate Output
            </div>
          )}

          {output && (
            <>
              {/* Summary panel */}
              <div className="mb-4 rounded-lg border border-border bg-bg2 px-6 py-5">
                <div className="mb-1.5 text-[11px] uppercase tracking-widest text-green">Result</div>
                <div className="text-[15px] text-text">{output.summary}</div>
              </div>

              {/* Code output with CopyButton — same pattern as CodeBlock copy affordance */}
              <div className="rounded-lg border border-border bg-bg p-4">
                <div className="mb-2 flex items-center justify-between gap-3 border-b border-border pb-2">
                  <span className="font-mono text-xs text-muted">Generated Output</span>
                  <CopyButton copied={copied} onClick={() => void handleCopy()} />
                </div>
                <pre className="overflow-x-auto bg-transparent font-mono text-[13px] leading-relaxed text-text">
                  {output.command}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
