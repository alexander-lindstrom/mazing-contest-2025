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

export const ChatRoom: React.FC<ChatRoomProps> = ({
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 rounded-md border p-4">
          <div ref={scrollRef}>
            {chatLog.length > 0 ? (
              <div className="space-y-1 text-sm">
                {chatLog.map(({ sender, timestamp, message }, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="font-semibold">{sender}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-gray-800">{message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Chat messages will appear here...
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
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};