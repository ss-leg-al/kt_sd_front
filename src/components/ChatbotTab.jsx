import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const ChatbotTab = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('쓰레기 줍는 중...');

  const loadingMessages = ['쓰레기 줍는 중...', '분리수거 하는 중...'];

  // 🗣️ TTS 함수
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = 1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);

    try {
      const response = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, role: 'env_helper' }),
      });

      const data = await response.json();
      const botMessage = { sender: 'bot', content: data.answer };
      setMessages((prev) => [...prev, botMessage]);

      // ✅ TTS 실행
      speakText(data.answer);
    } catch {
      const botMessage = { sender: 'bot', content: 'Error: Unable to fetch response.' };
      setMessages((prev) => [...prev, botMessage]);

      speakText('죄송합니다. 응답을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <Box sx={styles.container}>
      <Typography sx={styles.title}>환경에 관해 무엇이든 물어보세요</Typography>

      <Paper elevation={2} sx={styles.chatArea}>
        <List>
          {messages.map((msg, idx) => (
            <ListItem key={idx} sx={{ justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <Paper sx={msg.sender === 'user' ? styles.userBubble : styles.botBubble}>
                <ListItemText primary={msg.content} />
              </Paper>
            </ListItem>
          ))}
          {isLoading && (
            <ListItem sx={{ justifyContent: 'flex-start' }}>
              <Paper sx={styles.botBubble}>
                <ListItemText primary={loadingMessage} />
              </Paper>
            </ListItem>
          )}
        </List>
      </Paper>

      <Box sx={styles.inputRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#2e8b57',
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          sx={{
            backgroundColor: '#2e8b57',
            color: 'white',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#246e49' },
          }}
        >
          전송
        </Button>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    borderRadius: '12px',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: 'white',
    color: '#333',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '400px',
    maxHeight: '400px'
  },
  title: {
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2e8b57',
    fontFamily: 'Paperlogy, sans-serif',
  },
  chatArea: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '1rem',
    maxHeight: '200px',
    borderRadius: '12px',
    backgroundColor: '#f9f9f9',
  },
  userBubble: {
    padding: '0.8rem 1rem',
    maxWidth: '75%',
    backgroundColor: '#2e8b57',
    color: 'white',
    borderRadius: '12px',
  },
  botBubble: {
    padding: '0.8rem 1rem',
    maxWidth: '75%',
    backgroundColor: '#e0e0e0',
    color: 'black',
    borderRadius: '12px',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
  },
};

export default ChatbotTab;