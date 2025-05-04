import React, { useState, useEffect, useRef } from 'react';
import { executeCommand, CommandResult, getWelcomeMessage } from '@/utils/commands';

// 마크다운 파서 함수
const parseMarkdown = (text: string) => {
  // 볼드체 처리: **텍스트** -> <strong>텍스트</strong>
  let parsedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 헤더 처리: # 제목 -> <h1>제목</h1>
  parsedText = parsedText.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  parsedText = parsedText.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  parsedText = parsedText.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  
  // 이탈릭체 처리: *텍스트* -> <em>텍스트</em>
  parsedText = parsedText.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  
  // 코드 처리: `코드` -> <code>코드</code>
  parsedText = parsedText.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 리스트 처리: - 항목 -> • 항목 (불릿 기호로 변환)
  parsedText = parsedText.replace(/^- (.*)$/gm, '• $1');
  
  return parsedText;
};

interface TerminalProps {
  onSwitchToGUI?: () => void;
}

interface HistoryItem {
  command: string;
  result: CommandResult;
}

interface AutocompleteState {
  active: boolean;
  suggestions: string[];
  selectedIndex: number;
}

const Terminal: React.FC<TerminalProps> = ({ onSwitchToGUI }) => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: '',
      result: { output: getWelcomeMessage() }
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    active: false,
    suggestions: [],
    selectedIndex: 0
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState<string>('mean@portfolio:~$ ');

  // 터미널 스크롤을 항상 아래로 유지
  const scrollToBottom = () => {
    if (terminalRef.current) {
      const scrollHeight = terminalRef.current.scrollHeight;
      const height = terminalRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      terminalRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  // 히스토리가 변경되면 스크롤 처리
  useEffect(() => {
    // 최초 렌더링과 DOM 업데이트 후 스크롤 처리
    scrollToBottom();
    
    // 이미지나 다른 리소스가 로드되는 경우를 하다이할 여러 번의 스크롤 처리
    const timeouts = [50, 100, 200, 500, 1000].map(delay => {
      return setTimeout(scrollToBottom, delay);
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [history]);
  
  // 재렌더링 후에도 스크롤 처리 (윈도우 리사이즈 등)
  useEffect(() => {
    window.addEventListener('resize', scrollToBottom);
    return () => {
      window.removeEventListener('resize', scrollToBottom);
    };
  }, []);

  
  // 자동완성 상태 변경시 현재 선택된 항목 표시 업데이트
  useEffect(() => {
    if (autocomplete.active && autocomplete.suggestions.length > 0) {
      const lastHistoryItem = history[history.length - 1];
      if (lastHistoryItem.result.output && typeof lastHistoryItem.result.output !== 'string') {
        setHistory(prev => {
          const newHistory = [...prev];
          // 히스토리의 마지막 항목 업데이트
          newHistory[newHistory.length - 1] = {
            command: '',
            result: {
              output: (
                <div>
                  <p>가능한 명령어:</p>
                  {autocomplete.suggestions.map((cmd, i) => (
                    <div key={i} style={{ 
                      color: i === autocomplete.selectedIndex ? '#00ff00' : 'white',
                      fontWeight: i === autocomplete.selectedIndex ? 'bold' : 'normal',
                      paddingLeft: '10px'
                    }}>
                      {i === autocomplete.selectedIndex ? '▶ ' : '  '}{cmd}
                    </div>
                  ))}
                  <p>[탭] 누르면 선택한 명령어가 완성됩니다. [위/아래] 키로 선택을 이동할 수 있습니다.</p>
                </div>
              )
            }
          };
          return newHistory;
        });
      }
    }
  }, [autocomplete]);

  // 포커스 유지
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [history]);

  // 명령어 자동 완성 힌트를 얻는 함수
  const getCommandHint = () => {
    if (!input.trim()) return null;
    
    // research 서브명령어 처리
    const parts = input.trim().split(' ');
    if (parts.length > 1 && parts[0].toLowerCase() === 'research') {
      const subCommands = ['thesis', 'international-journal', 'international-conference', 'domestic-journal', 'domestic-conference', 'all'];
      const prefix = parts[1].toLowerCase();
      
      if (prefix) {
        const match = subCommands.find(cmd => cmd.startsWith(prefix));
        if (match) {
          return `research ${match}`;
        }
      }
      return null;
    }
    
    // 기본 명령어 처리
    const commands = ['help', 'about', 'skills', 'projects', 'contact', 'clear', 'whoami', 'developer', 'career', 'research', 'education'];
    const match = commands.find(cmd => cmd.startsWith(input.trim().toLowerCase()));
    
    return match || null;
  };
  
  const hint = getCommandHint();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    
    if (trimmedInput === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (trimmedInput === 'gui' && onSwitchToGUI) {
      onSwitchToGUI();
      return;
    }
    
    const result = executeCommand(trimmedInput);
    
    setHistory([
      ...history,
      {
        command: trimmedInput,
        result
      }
    ]);
    
    setInput('');
    setHistoryIndex(-1);
    
    // 추가 스크롤 동작
    requestAnimationFrame(() => {
      scrollToBottom();
      
      // 더 확실한 스크롤을 위해 여러 단계로 스크롤 처리
      setTimeout(() => scrollToBottom(), 50);
      setTimeout(() => scrollToBottom(), 150);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab 키 처리
    if (e.key === 'Tab') {
      e.preventDefault();
      
      // 자동완성 상태가 활성화되어 있으면 현재 선택항목 적용
      if (autocomplete.active) {
        setInput(autocomplete.suggestions[autocomplete.selectedIndex]);
        setAutocomplete({ active: false, suggestions: [], selectedIndex: 0 });
        return;
      }
      
      // 힌트가 있으면 힌트 적용
      if (hint) {
        setInput(hint);
        return;
      }
      
      // research 서브명령어 처리
      const parts = input.trim().split(' ');
      if (parts.length > 1 && parts[0].toLowerCase() === 'research') {
        const subCommands = ['thesis', 'international-journal', 'international-conference', 'domestic-journal', 'domestic-conference', 'all'];
        const prefix = parts[1].toLowerCase() || '';
        
        const matches = subCommands.filter(cmd => cmd.startsWith(prefix));
        if (matches.length === 1) {
          setInput(`research ${matches[0]}`);
        } else if (matches.length > 1) {
          setAutocomplete({
            active: true,
            suggestions: matches.map(match => `research ${match}`),
            selectedIndex: 0
          });
          
          // 자동완성 옵션을 화면에 추가
          setHistory(prev => [...prev, {
            command: '',
            result: {
              output: (
                <div>
                  <p>가능한 서브명령어:</p>
                  {matches.map((cmd, i) => (
                    <div key={i} style={{ 
                      color: i === 0 ? '#00ff00' : 'white',
                      fontWeight: i === 0 ? 'bold' : 'normal',
                      paddingLeft: '10px'
                    }}>
                      {i === 0 ? '▶ ' : '  '}research {cmd}
                    </div>
                  ))}
                  <p>[탭] 누르면 선택한 명령어가 완성됩니다. [위/아래] 키로 선택을 이동할 수 있습니다.</p>
                </div>
              )
            }
          }]);
        }
        return;
      }
      
      // 기본 명령어 처리
      const commands = ['help', 'about', 'skills', 'projects', 'contact', 'clear', 'whoami', 'developer', 'career', 'research', 'education'];
      
      if (input.trim()) {
        const matches = commands.filter(cmd => cmd.startsWith(input.trim().toLowerCase()));
        if (matches.length === 1) {
          setInput(matches[0]);
        } else if (matches.length > 1) {
          setAutocomplete({
            active: true,
            suggestions: matches,
            selectedIndex: 0
          });
          
          // 자동완성 옵션을 화면에 추가
          setHistory(prev => [...prev, {
            command: '',
            result: {
              output: (
                <div>
                  <p>가능한 명령어:</p>
                  {matches.map((cmd, i) => (
                    <div key={i} style={{ 
                      color: i === 0 ? '#00ff00' : 'white',
                      fontWeight: i === 0 ? 'bold' : 'normal',
                      paddingLeft: '10px'
                    }}>
                      {i === 0 ? '▶ ' : '  '}{cmd}
                    </div>
                  ))}
                  <p>[탭] 누르면 선택한 명령어가 완성됩니다. [위/아래] 키로 선택을 이동할 수 있습니다.</p>
                </div>
              )
            }
          }]);
        }
      }
      return;
    }
    
    // 화살표 키 처리
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // 자동완성 목록이 활성화되어 있으면 위로 이동
      if (autocomplete.active) {
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: prev.selectedIndex > 0 ? prev.selectedIndex - 1 : prev.suggestions.length - 1
        }));
        return;
      }
      
      const commandHistory = history
        .filter(item => item.command)
        .map(item => item.command);
      
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      // 자동완성 목록이 활성화되어 있으면 아래로 이동
      if (autocomplete.active) {
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: (prev.selectedIndex + 1) % prev.suggestions.length
        }));
        return;
      }
      
      const commandHistory = history
        .filter(item => item.command)
        .map(item => item.command);
      
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else {
      // 다른 키를 누르면 자동완성 비활성화
      if (autocomplete.active) {
        setAutocomplete({ active: false, suggestions: [], selectedIndex: 0 });
      }
    }
  };

  return (
    <div 
      className="terminal-container"
      ref={terminalRef}
      onClick={() => inputRef.current?.focus()}
      style={{ 
        fontFamily: 'monospace',
        overflowY: 'scroll',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        position: 'relative',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* IE and Edge */
      }}
    >
      <style jsx>{`
        .terminal-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .terminal-container {
          height: 100%;
          overflow-y: auto;
          padding: 10px;
          background-color: #000;
          color: #fff;
        }
        .terminal-command-line {
          margin-bottom: 4px;
        }
        .terminal-prompt {
          color: #0f0;
          margin-right: 8px;
        }
        .terminal-output {
          margin-bottom: 16px;
          white-space: pre-wrap;
        }
        .terminal-error {
          color: #f00;
        }
        /* 마크다운 스타일 */
        .terminal-output strong {
          color: #ffff00;
          font-weight: bold;
        }
        .terminal-output h1 {
          color: #ff66ff;
          font-size: 1.5em;
          margin: 8px 0;
        }
        .terminal-output h2 {
          color: #66ffff;
          font-size: 1.3em;
          margin: 6px 0;
        }
        .terminal-output h3 {
          color: #ff9966;
          font-size: 1.1em;
          margin: 4px 0;
        }
        .terminal-output em {
          color: #99ff99;
          font-style: italic;
        }
        .terminal-output code {
          background-color: #333;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
      `}</style>
      {history.map((item, index) => (
        <div key={index}>
          {item.command && (
            <div className="terminal-command-line">
              <span className="terminal-prompt">{prompt}</span>
              <span>{item.command}</span>
            </div>
          )}
          <div className={`terminal-output ${item.result.isError ? 'terminal-error' : ''}`}>
            {typeof item.result.output === 'string' 
              ? item.result.output.split('\n').map((line, i) => 
                  <div key={i} style={{minHeight: '1.2em', whiteSpace: 'pre-wrap'}} 
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(line) }} />
                )
              : item.result.output}
          </div>
        </div>
      ))}
      
      <div className="flex">
        <span className="terminal-prompt">{prompt}</span>
        <div className="flex-grow relative">
          <form onSubmit={handleSubmit} className="flex-grow w-full">
            <div className="relative">
              {hint && input.trim() !== hint && (
                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    color: 'rgba(255, 255, 255, 0.4)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    width: '100%'
                  }}
                >
                  {input}{hint.substring(input.length)}
                </div>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  backgroundColor: 'transparent',
                  width: '100%',
                  border: 'none',
                  borderBottom: 'none',
                  textDecoration: 'none',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  caretColor: 'white',
                  color: 'white',
                  outline: 'none',
                  position: 'relative',
                  zIndex: 1
                }}
                autoFocus
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;