import React, { useState, useEffect, useCallback } from 'react';
import './Chat.css';

interface ChatProps {
  idInstance: string;
  apiTokenInstance: string;
  phoneNumber: string;
  onMessageSent: (message: string) => void;
}

interface Message {
  id: number;
  text: string;
  type: 'sent' | 'received';
  status?: 'sent' | 'delivered' | 'read';
  timestamp: string;
}

interface ChatMessages {
  [phoneNumber: string]: Message[];
}

const Chat: React.FC<ChatProps> = ({ idInstance, apiTokenInstance, phoneNumber, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState<ChatMessages>({});

  useEffect(() => {
    if (!allMessages[phoneNumber]) {
      setAllMessages(prev => ({
        ...prev,
        [phoneNumber]: []
      }));
    }
  }, [phoneNumber, allMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).toLowerCase();
  };

  const sendMessage = async () => {
    try {
      const response = await fetch(`https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: `${phoneNumber}@c.us`,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage: Message = {
        id: Date.now(),
        text: message,
        type: 'sent',
        status: 'sent',
        timestamp: formatTime(new Date())
      };

      setAllMessages(prev => ({
        ...prev,
        [phoneNumber]: [...(prev[phoneNumber] || []), newMessage]
      }));
      onMessageSent(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const deleteNotification = useCallback(async (receiptId: number) => {
    try {
      await fetch(`https://api.green-api.com/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [idInstance, apiTokenInstance]);

  useEffect(() => {
    const receiveMessages = async () => {
      try {
        const response = await fetch(`https://api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        
        if (data) {
          const senderNumber = data.body?.senderData?.sender?.replace('@c.us', '');
          
          if (senderNumber === phoneNumber && data.body?.messageData?.textMessageData?.textMessage) {
            const newMessage: Message = {
              id: Date.now(),
              text: data.body.messageData.textMessageData.textMessage,
              type: 'received',
              timestamp: formatTime(new Date())
            };
            
            setAllMessages(prev => ({
              ...prev,
              [phoneNumber]: [...(prev[phoneNumber] || []), newMessage]
            }));
          }
          
          if (data.body?.status === 'read') {
            setAllMessages(prev => {
              const updatedMessages = { ...prev };
              if (updatedMessages[phoneNumber]) {
                updatedMessages[phoneNumber] = updatedMessages[phoneNumber].map(msg => 
                  msg.type === 'sent' ? { ...msg, status: 'read' } : msg
                );
              }
              return updatedMessages;
            });
          }
          
          await deleteNotification(data.receiptId);
        }
      } catch (error) {
        console.error('Error receiving message:', error);
      }
    };

    const intervalId = setInterval(receiveMessages, 5000);
    return () => clearInterval(intervalId);
  }, [idInstance, apiTokenInstance, phoneNumber, deleteNotification]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat with +{phoneNumber}</h3>
      </div>
      <div className="messages-container">
        {(allMessages[phoneNumber] || []).map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.type} ${msg.status === 'read' ? 'read' : ''}`}
          >
            <div className="message-content">
              {msg.text}
            </div>
            <span className="message-time">{msg.timestamp}</span>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat; 