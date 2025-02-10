import React, { useState } from 'react'
import Login from './Login'
import Chat from './Chat'
import './App.css'

interface ChatInfo {
  phoneNumber: string
  lastMessage?: string
  avatar?: string
}

const App: React.FC = () => {
  const [credentials, setCredentials] = useState<{ idInstance: string; apiTokenInstance: string } | null>(null)
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [chats, setChats] = useState<ChatInfo[]>([])

  const handleLogin = (idInstance: string, apiTokenInstance: string) => {
    setCredentials({ idInstance, apiTokenInstance })
  }

  const handleNewChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const phoneNumber = (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value.trim()
    
    if (!/^\d+$/.test(phoneNumber)) {
      alert('Please enter a valid phone number (only digits allowed)')
      return
    }
    
    if (phoneNumber.length < 10) {
      alert('Phone number must be at least 10 digits long')
      return
    }

    if (phoneNumber && !chats.find(chat => chat.phoneNumber === phoneNumber)) {
      setChats(prev => [...prev, { phoneNumber }])
      setActiveChat(phoneNumber)
      e.currentTarget.reset()
    } else if (chats.find(chat => chat.phoneNumber === phoneNumber)) {
      setActiveChat(phoneNumber)
      e.currentTarget.reset()
    }
  }

  const updateLastMessage = (phoneNumber: string, message: string) => {
    setChats(prev => 
      prev.map(chat => 
        chat.phoneNumber === phoneNumber 
          ? { ...chat, lastMessage: message }
          : chat
      )
    )
  }

  return (
    <div className="app-container">
      {!credentials ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>WhatsApp Web</h2>
            </div>
            <form className="new-chat" onSubmit={handleNewChat}>
              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                pattern="\d+"
                title="Please enter only digits"
                minLength={10}
                required
              />
              <button type="submit">New Chat</button>
            </form>
            <div className="chats-list">
              {chats.map(chat => (
                <div
                  key={chat.phoneNumber}
                  className={`chat-item ${activeChat === chat.phoneNumber ? 'active' : ''}`}
                  onClick={() => setActiveChat(chat.phoneNumber)}
                >
                  <div className="avatar">
                    {chat.avatar ? (
                      <img src={chat.avatar} alt={`Avatar for ${chat.phoneNumber}`} />
                    ) : (
                      <div className="default-avatar">
                        <svg viewBox="0 0 212 212" width="212" height="212">
                          <path d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z" fill="none"/>
                          <path d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c-.033.056-.073.119-.104.174a47.92 47.92 0 0 0-1.07 1.926c-.559 1.068-.818 1.678-.818 1.678v.398c18.285 17.927 43.322 28.985 70.945 28.985 27.678 0 52.761-11.103 71.055-29.095v-.289s-.619-1.45-1.992-3.778a58.346 58.346 0 0 0-1.446-2.322zM106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">+{chat.phoneNumber}</div>
                    {chat.lastMessage && (
                      <div className="last-message">{chat.lastMessage}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="chat-area">
            {activeChat ? (
              <Chat 
                idInstance={credentials.idInstance} 
                apiTokenInstance={credentials.apiTokenInstance}
                phoneNumber={activeChat}
                onMessageSent={(message) => updateLastMessage(activeChat, message)}
              />
            ) : (
              <div className="no-chat-selected">
                <h3>Enter a phone number and click "New Chat" to start messaging</h3>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
