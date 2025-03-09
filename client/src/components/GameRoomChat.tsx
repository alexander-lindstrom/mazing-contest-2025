import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@mazing/util';

interface ChatRoomProps {
  chatLog: ChatMessage[];
  onSendMessage: (message: string) => void;
  className?: string;
  title?: string;
}

export const GameRoomChat: React.FC<ChatRoomProps> = ({
  chatLog,
  onSendMessage,
  className = '',
  title = 'Chat'
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
    <Card className={`bg-yellow-300 border-4 border-black p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform ${className}`}>
      <CardHeader className="p-2">
        <CardTitle className="text-2xl font-black uppercase tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <ScrollArea className="h-48 rounded-md border-4 border-black p-4 bg-white">
          <div ref={scrollRef}>
            {chatLog.length > 0 ? (
              <div className="space-y-1 text-sm">
                {chatLog.map(({ sender, timestamp, message }, index) => (
                  <div key={index} className="flex items-start gap-2 py-2 border-b border-gray-200">
                    <span className="font-bold">{sender}:</span>
                    <span className="flex-1">{message}</span>
                    <span className="text-xs text-gray-500 self-end">
                      {new Date(timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-lg font-bold text-center p-8 border-2 border-dashed border-gray-400">
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
            className="border-3 border-black rounded-md p-3 font-medium bg-white"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-cyan-200 text-black hover:bg-cyan-300 font-bold py-2 px-4 border-3 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};