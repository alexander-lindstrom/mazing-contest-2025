import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@mazing/util';

interface GameChatProps {
  chatLog: ChatMessage[];
  onSendMessage: (message: string) => void;
  className?: string;
  title?: string;
}

export const GameChat: React.FC<GameChatProps> = ({
  chatLog,
  onSendMessage,
  className = '',
  title = 'Chat',
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current!.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 10);
    }
  }, [chatLog]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) {
      return;
    }
    onSendMessage(chatMessage);
    setChatMessage('');
  };

  return (
    <Card className={`bg-slate-800 p-3 rounded-lg shadow-lg ${className}`}>
      <CardHeader className="p-2">
        <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        {/* Chat Log */}
        <ScrollArea className="h-48 rounded-md bg-white p-3">
          <div ref={scrollRef}>
            {chatLog.length > 0 ? (
              <div className="space-y-1">
                {chatLog.map(({ sender, timestamp, message }, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 py-1 text-sm text-slate-800"
                  >
                    <span className="font-bold">{sender}:</span>
                    <span className="flex-1">{message}</span>
                    <span className="text-xs text-slate-500 self-end">
                      {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-4">
                No messages yet.
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-slate-500"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};