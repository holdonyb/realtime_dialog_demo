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
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
  const [shouldPlayAudio, setShouldPlayAudio] = useState(true);
//   const [currentTranscript, setCurrentTranscript] = useState('');

  // Add ref for chat container
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Add a new ref to track audio playback status
  const audioPlayedRef = useRef<{[key: string]: boolean}>({});

  // Add new ref to track streaming status
  const streamingAudioRef = useRef<{[key: string]: boolean}>({});

  // Add new state for typing effect
  const [typingText, setTypingText] = useState<{[key: string]: string}>({});
  const [isTyping, setIsTyping] = useState<{[key: string]: boolean}>({});
  const typingSpeedRef = useRef(30); // milliseconds per character

  // Add new ref to track new messages
  const newMessagesRef = useRef<Set<string>>(new Set());

  // Core functions
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    try {
      await wavRecorder.begin();
      await wavStreamPlayer.connect();
      await client.connect();
      
      setIsConnected(true);
      setItems(client.conversation.getItems());

      // Remove automatic initial message
      // if (!isVoiceChatMode) {
      //   client.sendUserMessageContent([{ type: 'input_text', text: 'Hello!' }]);
      // }
    } catch (error) {
      console.error('Error connecting:', error);
      setIsConnected(false);
    }
  }, []);

  const startRecording = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;

    try {
      if (!isConnected) {
        await connectConversation();
      }

      if (!client.isConnected()) {
        await client.connect();
      }

      if (wavRecorder.getStatus() === 'ended') {
        await wavRecorder.begin();
      }

      setIsRecording(true);
      
      client.updateSession({
        turn_detection: { type: 'server_vad' }
      });
      
      await wavRecorder.record((data) => {
        if (client.isConnected()) {
          client.appendInputAudio(data.mono);
        }
      });
      
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

    const client = clientRef.current;
    
    try {
      if (!isConnected) {
        await connectConversation();
      }

      if (!client.isConnected()) {
        await client.connect();
      }

      client.sendUserMessageContent([{
        type: 'input_text',
        text: userInput,
      }]);

      setUserInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startVoiceChat = async () => {
    try {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;

      // Clear new messages when starting voice chat
      newMessagesRef.current.clear();
      
      // Stop all audio immediately
      const audios = document.getElementsByTagName('audio');
      Array.from(audios).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      await wavStreamPlayer.interrupt();

      // Wait for audio to fully stop
      await new Promise(resolve => setTimeout(resolve, 50));

      setIsVoiceChatMode(true);
      setShouldPlayAudio(true);

      if (!isConnected) {
        await connectConversation();
      }

      if (!client.isConnected()) {
        await client.connect();
      }

      client.updateSession({
        turn_detection: { type: 'server_vad' }
      });

      if (wavRecorder.getStatus() === 'ended') {
        await wavRecorder.begin();
      }

      setIsRecording(true);
      await wavRecorder.record((data) => {
        if (client.isConnected()) {
          client.appendInputAudio(data.mono);
        }
      });

    } catch (error) {
      console.error('Error starting voice chat:', error);
      setIsVoiceChatMode(false);
      setIsRecording(false);
      setShouldPlayAudio(false);
    }
  };

  const endVoiceChat = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    
    // Clear new messages when ending voice chat
    newMessagesRef.current.clear();
    
    setIsVoiceChatMode(false);
    setIsRecording(false);
    setShouldPlayAudio(false);
    
    // Reset audio tracking
    audioPlayedRef.current = {};
    streamingAudioRef.current = {};
    
    client.updateSession({
      turn_detection: null
    });
    
    // Stop recording and playback
    await wavRecorder.pause();
    await wavRecorder.end();  // Add this to fully stop recording
    await wavStreamPlayer.interrupt();
    
    setTimeout(scrollToBottom, 100);
  };

  // Add new function to reset conversation
  const resetConversation = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    
    try {
      // Stop any ongoing recordings or playback
      if (isRecording) {
        await wavRecorder.pause();
        await wavRecorder.end();
      }
      await wavStreamPlayer.interrupt();
      
      // Reset all states
      setIsVoiceChatMode(false);
      setIsRecording(false);
      setShouldPlayAudio(true);
      setIsConnected(false);
      setUserInput('');
      
      // Clear items first
      setItems([]);
      
      // Clear audio tracking
      audioPlayedRef.current = {};
      streamingAudioRef.current = {};
      
      // Reset client and reconnect
      client.reset();
      await connectConversation();
      
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  // Update the scroll helper function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Set up event listeners and tools
  useEffect(() => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    client.updateSession({ 
      instructions: instructions,
      input_audio_transcription: { model: 'whisper-1' }
    });

    // Define the handler function
    function handleConversationUpdate({ item, delta }: any) {
      const items = client.conversation.getItems();
      
      // Handle assistant text updates
      if (item.role === 'assistant') {
        if (delta?.text) {
          if (!item.formatted.text) {
            item.formatted.text = '';
          }
          item.formatted.text += delta.text;
          setTimeout(scrollToBottom, 100);
        }

        // Handle audio when message is complete
        if (item.status === 'completed') {
          if (!item.formatted.text && item.formatted.transcript) {
            item.formatted.text = item.formatted.transcript;
          }

          // Process audio only when text is complete
          if (item.formatted.audio?.length && !item.formatted.file) {
            WavRecorder.decode(item.formatted.audio, 24000, 24000)
              .then(wavFile => {
                item.formatted.file = wavFile;
                if (isVoiceChatMode && shouldPlayAudio) {
                  newMessagesRef.current.add(item.id);
                }
                setItems([...items]);
              })
              .catch(error => console.error('Error processing audio:', error));
          }
        }
      }

      // Handle user transcripts
      if (item.role === 'user' && delta?.transcript) {
        item.formatted.text = delta.transcript;
        if (!isVoiceChatMode) {
          setTimeout(scrollToBottom, 100);
        }
      }

      setItems([...items]);
    }

    client.on('conversation.updated', handleConversationUpdate);

    return () => {
      try {
        client.off('conversation.updated', handleConversationUpdate);
      } catch (error) {
        console.warn('Error removing event listener:', error);
      }
    };
  }, [isVoiceChatMode, shouldPlayAudio]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup function to stop all audio when component unmounts
      // or when voice chat mode changes
      const audios = document.getElementsByTagName('audio');
      Array.from(audios).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [isVoiceChatMode]);

  // Mobile-optimized UI
  return (
    <div className="mobile-console">
      <header className="mobile-header">
        <button 
          onClick={resetConversation} 
          className="end-chat-button"
        >
          <X size={20} />
          <span>End Chat</span>
        </button>
        <img 
          src="/openai-logomark.svg" 
          alt="OpenAI Logo" 
        />
        <h1>AITA Assistant</h1>
      </header>

      <main 
        ref={chatContainerRef}
        className={`chat-container ${isVoiceChatMode ? 'voice-mode' : ''}`}
      >
        {items.map((item) => (
          <div key={item.id} className={`message ${item.role}`}>
            <div className="message-content">
              {item.role === 'assistant' ? (
                <>
                  {item.formatted.text && (
                    <div className="text-content">
                      <ReactMarkdown>
                        {item.formatted.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  {item.formatted.file && shouldPlayAudio && isVoiceChatMode && newMessagesRef.current.has(item.id) && (
                    <div className="audio-content">
                      <audio 
                        ref={(audio) => {
                          if (audio) {
                            if (!isVoiceChatMode || !shouldPlayAudio) {
                              audio.pause();
                              audio.currentTime = 0;
                            }
                          }
                        }}
                        src={item.formatted.file.url}
                        autoPlay={true}
                        onPlay={() => {
                          console.log('Playing new message audio:', item.id);
                        }}
                        onEnded={() => {
                          console.log('Audio finished:', item.id);
                          newMessagesRef.current.delete(item.id);
                          // Force re-render to remove audio element
                          setItems(prevItems => [...prevItems]);
                        }}
                        preload="auto"
                        controls={false}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-content">
                  {item.formatted.transcript || item.formatted.text || ''}
                </div>
              )}
            </div>
          </div>
        ))}
        {/* {isVoiceChatMode && currentTranscript && (
          <div className="current-transcript">
            <p>{currentTranscript}</p>
          </div>
        )} */}
      </main>

      {isVoiceChatMode ? (
        <div className="voice-mode-container">
          <button onClick={endVoiceChat} className="hang-off-button">
            <X size={20} />
            End Voice Chat
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
          <button onClick={startVoiceChat} className="mic-button">
            <Mic size={20} />
          </button>
        </footer>
      )}
    </div>
  );
}
