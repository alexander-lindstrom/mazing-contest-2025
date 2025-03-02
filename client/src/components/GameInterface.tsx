import React from 'react';
import { ChatRoom } from './ChatRoom';
import ResultDisplay from './ResultDisplay';
import { ChatMessage, RoundResult } from '@mazing/util';

interface GameInterfaceProps {
  chatLog: ChatMessage[];
  onChatMessage: (message: string) => void;
  currentScore: RoundResult[] | null;
  rounds: number;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  chatLog,
  onChatMessage,
  currentScore,
  rounds
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      <div className="w-full">
        <ResultDisplay 
          score={currentScore}
          totalRounds={rounds}
        />
      </div>
      
      <div className="w-full">
        <ChatRoom
          chatLog={chatLog}
          onSendMessage={onChatMessage}
          title="Chat room"
        />
      </div>
    </div>
  );
};

export default GameInterface;