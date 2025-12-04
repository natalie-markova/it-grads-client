import { useState, useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = '400px'
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);

  useEffect(() => {
    updateLineNumbers();
  }, [value]);

  const updateLineNumbers = () => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const lineNumbersEl = document.getElementById('line-numbers');
    if (lineNumbersEl) {
      lineNumbersEl.scrollTop = target.scrollTop;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden" style={{ height }}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-gray-400 text-sm">{language}</span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex h-[calc(100%-40px)]">
        {/* Line numbers */}
        <div
          id="line-numbers"
          className="bg-gray-800/50 text-gray-500 text-right py-2 px-3 select-none overflow-hidden text-sm font-mono"
          style={{ minWidth: '50px' }}
        >
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">{num}</div>
          ))}
        </div>

        {/* Code area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
          className="flex-1 bg-transparent text-gray-100 p-2 resize-none focus:outline-none font-mono text-sm leading-6 overflow-auto"
          style={{
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}