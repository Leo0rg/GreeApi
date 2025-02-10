import React, { useEffect, useState } from 'react';

interface MessageReceiverProps {
  idInstance: string;
  apiTokenInstance: string;
}

const MessageReceiver: React.FC<MessageReceiverProps> = ({ idInstance, apiTokenInstance }) => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        if (data && data.body && data.body.messageData) {
          const newMessage = data.body.messageData.textMessageData.textMessage;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const intervalId = setInterval(fetchMessages, 5000);

    return () => clearInterval(intervalId);
  }, [idInstance, apiTokenInstance]);

  return (
    <div>
      <h3>Received Messages</h3>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default MessageReceiver; 