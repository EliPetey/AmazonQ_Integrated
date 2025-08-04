import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 20px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 20px;
`;

const MessageGroup = styled.div`
  margin-bottom: 20px;
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 80%;
  ${props => props.isUser ? `
    background-color: #0078d7;
    color: white;
    margin-left: auto;
  ` : `
    background-color: white;
    border: 1px solid #eaeaea;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  `}
`;

const Citation = styled.div`
  font-size: 12px;
  margin-top: 8px;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

const InputForm = styled.form`
  display: flex;
  padding: 10px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: none;
  outline: none;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 0 20px;
  background-color: #0078d7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #005a9e;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ThinkingIndicator = styled.div`
  padding: 10px;
  font-style: italic;
  color: #666;
`;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!input.trim()) return;
  
  const userMessage = {
    type: 'user',
    content: input
  };
  
  setMessages([...messages, userMessage]);
  setInput('');
  setIsLoading(true);
  
  try {
    console.log("Sending request to:", API_ENDPOINT);
    
    const response = await axios.post(API_ENDPOINT, {
      query: input,
      conversationId: conversationId,
      userId: 'user-' + Date.now()
    });
    
    console.log("Received response:", response.data);
    
    setConversationId(response.data.conversationId);
    
    const botResponse = {
      type: 'bot',
      content: response.data.text,
      citations: response.data.citations || []
    };
    
    setMessages(prev => [...prev, botResponse]);
  } catch (error) {
    console.error('Error calling API:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    const errorMessage = {
      type: 'bot',
      content: `Sorry, I encountered an error: ${error.message}. Please try again.`
    };
    
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
  
  return (
    <ChatContainer>
      <Header>
        <h1>Engineering Document Assistant</h1>
        <p>Ask questions about your engineering documents</p>
      </Header>
      
      <MessagesContainer>
        {messages.map((message, index) => (
          <MessageGroup key={index}>
            <Message isUser={message.type === 'user'}>
              <div>{message.content}</div>
            </Message>
            
            {message.citations && message.citations.length > 0 && (
              <div>
                {message.citations.map((citation, i) => (
                  <Citation key={i}>
                    <strong>Source:</strong> {citation.title || 'Document'}
                    {citation.snippet && (
                      <div>"{citation.snippet}"</div>
                    )}
                  </Citation>
                ))}
              </div>
            )}
          </MessageGroup>
        ))}
        
        {isLoading && <ThinkingIndicator>Thinking...</ThinkingIndicator>}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputForm onSubmit={handleSubmit}>
        <Input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a question about your engineering documents..." 
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </InputForm>
    </ChatContainer>
  );
};

export default Chat;