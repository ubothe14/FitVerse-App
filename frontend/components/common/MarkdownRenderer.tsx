import React, { useMemo } from 'react';

/* ────────────────────────────────────────────────────────────
 * Lightweight, zero-dependency Markdown → React renderer.
 * Supported syntax:
 *   # / ## / ### headings
 *   **bold**, *italic*, `inline code`
 *   - / * unordered lists (nested via 2-space indent)
 *   1. ordered lists
 *   --- horizontal rules
 *   Paragraph breaks (double newlines)
 * ──────────────────────────────────────────────────────────── */

// ── Inline formatting ────────────────────────────────────────

const renderInline = (text: string): React.ReactNode[] => {
  // Split on: **bold**, *italic*, `code`
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push plain text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="bg-slate-800/50 px-1.5 py-0.5 rounded text-emerald-300 text-sm font-mono"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      parts.push(
        <strong key={match.index} className="text-white font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

// ── Block types ──────────────────────────────────────────────

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'hr' }
  | { type: 'ul'; items: ListItem[] }
  | { type: 'ol'; items: ListItem[] }
  | { type: 'paragraph'; text: string };

interface ListItem {
  text: string;
  children: ListItem[];
}

// ── Parser ───────────────────────────────────────────────────

const parseBlocks = (src: string): Block[] => {
  const lines = src.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  const consumeList = (startIdx: number, ordered: boolean): { items: ListItem[]; nextIdx: number } => {
    const items: ListItem[] = [];
    let idx = startIdx;

    while (idx < lines.length) {
      const line = lines[idx];

      // Detect indent level (spaces)
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1].length : 0;

      // Check if it's a list item
      const ulMatch = line.match(/^(\s*)[-*]\s+(.*)/);
      const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);

      const isListItem = ordered ? olMatch : ulMatch;
      if (!isListItem && indent === 0) break;
      if (!isListItem) break;

      const content = isListItem[2];
      const item: ListItem = { text: content, children: [] };
      idx++;

      // Check for nested items (deeper indent)
      if (idx < lines.length) {
        const nextLine = lines[idx];
        const nextIndent = (nextLine.match(/^(\s*)/) || ['', ''])[1].length;
        const nextIsUl = /^\s*[-*]\s+/.test(nextLine);
        const nextIsOl = /^\s*\d+\.\s+/.test(nextLine);

        if ((nextIsUl || nextIsOl) && nextIndent > indent) {
          const nested = consumeList(idx, nextIsOl);
          item.children = nested.items;
          idx = nested.nextIdx;
        }
      }

      items.push(item);
    }

    return { items, nextIdx: idx };
  };

  while (i < lines.length) {
    const line = lines[i];

    // Blank line → skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const { items, nextIdx } = consumeList(i, false);
      blocks.push({ type: 'ul', items });
      i = nextIdx;
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const { items, nextIdx } = consumeList(i, true);
      blocks.push({ type: 'ol', items });
      i = nextIdx;
      continue;
    }

    // Paragraph: consume consecutive non-blank, non-special lines
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      const l = lines[i];
      if (/^---+$/.test(l.trim())) break;
      if (/^#{1,3}\s+/.test(l)) break;
      if (/^\s*[-*]\s+/.test(l)) break;
      if (/^\s*\d+\.\s+/.test(l)) break;
      paraLines.push(l);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return blocks;
};

// ── Renderers ────────────────────────────────────────────────

const renderListItems = (items: ListItem[], ordered: boolean): React.ReactNode => {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={ordered ? 'list-none space-y-1 pl-4' : 'list-none space-y-1 pl-4'}>
      {items.map((item, idx) => (
        <li key={idx} className="flex flex-col">
          <span className="flex items-start gap-2 text-slate-300 leading-relaxed">
            {ordered ? (
              <span className="text-emerald-400 font-semibold text-sm mt-0.5 shrink-0">
                {idx + 1}.
              </span>
            ) : (
              <span className="text-emerald-400 mt-2 shrink-0">
                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
            )}
            <span>{renderInline(item.text)}</span>
          </span>
          {item.children.length > 0 && (
            <div className="ml-2">{renderListItems(item.children, false)}</div>
          )}
        </li>
      ))}
    </Tag>
  );
};

const renderBlock = (block: Block, idx: number): React.ReactNode => {
  switch (block.type) {
    case 'heading':
      if (block.level === 1) {
        return (
          <h1 key={idx} className="text-xl font-semibold text-white mt-6 mb-2 first:mt-0">
            {renderInline(block.text)}
          </h1>
        );
      }
      if (block.level === 2) {
        return (
          <h2 key={idx} className="text-lg font-semibold text-white mt-5 mb-2 first:mt-0">
            {renderInline(block.text)}
          </h2>
        );
      }
      return (
        <h3 key={idx} className="text-base font-semibold text-white mt-4 mb-1.5 first:mt-0">
          {renderInline(block.text)}
        </h3>
      );

    case 'hr':
      return <hr key={idx} className="border-slate-700/50 my-4" />;

    case 'ul':
      return <div key={idx} className="my-2">{renderListItems(block.items, false)}</div>;

    case 'ol':
      return <div key={idx} className="my-2">{renderListItems(block.items, true)}</div>;

    case 'paragraph':
      return (
        <p key={idx} className="text-slate-300 leading-relaxed my-2">
          {renderInline(block.text)}
        </p>
      );
  }
};

// ── Component ────────────────────────────────────────────────

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return <div className="space-y-1">{blocks.map(renderBlock)}</div>;
};
