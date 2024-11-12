import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../../lib/wavtools/index.js';
import { instructions } from '../../utils/conversation_config.js';
import { WavRenderer } from '../../utils/wav_renderer';
import { X, Edit, Zap, Mic, Send } from 'react-feather';
import ReactMarkdown from 'react-markdown';
import './MobileConsolePage.scss';

const LOCAL_RELAY_SERVER_URL = process.env.REACT_APP_RELAY_SERVER_URL || '';

export function MobileConsolePage() {
  // Core refs
  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer({ sampleRate: 24000 }));
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(LOCAL_RELAY_SERVER_URL ? 
      { url: LOCAL_RELAY_SERVER_URL } : 
      { apiKey: process.env.REACT_APP_OPENAI_API_KEY || '', dangerouslyAllowAPIKeyInBrowser: true }
    )
  );

  // State
  const [items, setItems] = useState<ItemType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showVoiceButton, setShowVoiceButton] = useState(true);

  // Core functions
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    setIsConnected(true);
    setItems(client.conversation.getItems());

    await wavRecorder.begin();
    await wavStreamPlayer.connect();
    await client.connect();

    client.sendUserMessageContent([{ type: 'input_text', text: 'Hello!' }]);
  }, []);

  const startRecording = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    try {
      if (!isConnected) {
        await connectConversation();
      }

      if (wavRecorder.getStatus() === 'ended') {
        await wavRecorder.begin();
      }

      setIsRecording(true);
      
      client.updateSession({
        turn_detection: { type: 'server_vad' }
      });
      
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    
    setIsRecording(false);
    
    client.updateSession({
      turn_detection: null
    });
    
    await wavRecorder.pause();
    client.createResponse();
  };

  const handleTextInputSubmit = async () => {
    if (userInput.trim() === '') return;

    if (!isConnected) {
      await connectConversation();
    }

    clientRef.current.sendUserMessageContent([{
      type: 'input_text',
      text: userInput,
    }]);

    setUserInput('');
  };

  // Set up event listeners and tools
  useEffect(() => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    client.updateSession({ 
      instructions: instructions,
      input_audio_transcription: { model: 'whisper-1' }
    });

    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.role === 'assistant' && item.status === 'completed' && 
          item.formatted.audio?.length && !item.formatted.file) {
        try {
          const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
          item.formatted.file = wavFile;
          setItems([...items]);
        } catch (error) {
          console.error('Error processing audio:', error);
        }
      }
      setItems(items);
    });

    return () => {
      client.reset();
    };
  }, []);

  // Mobile-optimized UI
  return (
    <div className="mobile-console">
      <header className="mobile-header">
        <img src="/openai-logomark.svg" alt="OpenAI Logo" style={{ maxWidth: '80px', maxHeight: '80px' }} />
        <h1>AITA Assistant</h1>
      </header>

      <main className="chat-container">
        {items.map((item) => (
          <div key={item.id} className={`message ${item.role}`}>
            <div className="message-content">
              {item.role === 'assistant' ? (
                <ReactMarkdown>{item.formatted.text || ''}</ReactMarkdown>
              ) : (
                <p>{item.formatted.text || item.formatted.transcript}</p>
              )}
              {item.formatted.file && (
                <audio src={item.formatted.file.url} controls />
              )}
            </div>
          </div>
        ))}
      </main>

      {isRecording ? (
        <div className="voice-mode-container">
          <button onClick={stopRecording} className="hang-off-button">
            Exit Voice Mode
          </button>
        </div>
      ) : (
        <footer className="input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleTextInputSubmit()}
          />
          <button onClick={handleTextInputSubmit} className="send-button">
            <Send size={20} />
          </button>
          <button 
            onClick={startRecording}
            className="mic-button"
          >
            <Mic size={20} />
          </button>
        </footer>
      )}
    </div>
  );
}
