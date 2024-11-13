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

      if (!isVoiceChatMode) {
        client.sendUserMessageContent([{ type: 'input_text', text: 'Hello!' }]);
      }
    } catch (error) {
      console.error('Error connecting:', error);
      setIsConnected(false);
    }
  }, [isVoiceChatMode]);

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
      setShouldPlayAudio(true);
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;

      setIsVoiceChatMode(true);

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
    
    setIsVoiceChatMode(false);
    setIsRecording(false);
    setShouldPlayAudio(false);
    
    // Reset all audio tracking
    audioPlayedRef.current = {};
    streamingAudioRef.current = {};
    
    client.updateSession({
      turn_detection: null
    });
    
    await wavRecorder.pause();
    await wavStreamPlayer.interrupt();
    setTimeout(scrollToBottom, 100);
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

    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      
      // Only stream audio if we haven't played the full file yet
      if (delta?.audio && shouldPlayAudio && !audioPlayedRef.current[item.id]) {
        if (!streamingAudioRef.current[item.id]) {
          streamingAudioRef.current[item.id] = true;
          wavStreamPlayer.add16BitPCM(delta.audio, item.id);
        }
      }

      // Handle assistant text updates
      if (item.role === 'assistant') {
        if (delta?.text) {
          if (!item.formatted.text) {
            item.formatted.text = '';
          }
          item.formatted.text += delta.text;
          setTimeout(scrollToBottom, 100);
        }

        // Check completion status
        if (item.status === 'completed') {
          if (!item.formatted.text && item.formatted.transcript) {
            item.formatted.text = item.formatted.transcript;
          }

          // Handle audio processing
          if (item.formatted.audio?.length && !item.formatted.file) {
            try {
              const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
              item.formatted.file = wavFile;
              // Stop streaming audio when file is ready
              wavStreamPlayer.interrupt();
              // Reset streaming status for this item
              delete streamingAudioRef.current[item.id];
            } catch (error) {
              console.error('Error processing audio:', error);
            }
          }
        }
      }

      setItems([...items]);
    });

    return () => {
      client.reset();
      audioPlayedRef.current = {};
      streamingAudioRef.current = {};
    };
  }, [isVoiceChatMode, shouldPlayAudio]);

  // Mobile-optimized UI
  return (
    <div className="mobile-console">
      <header className="mobile-header">
        <img src="/openai-logomark.svg" alt="OpenAI Logo" style={{ width: '24px', height: '24px' }} />
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
                      <ReactMarkdown>{item.formatted.text}</ReactMarkdown>
                    </div>
                  )}
                  {item.formatted.file && shouldPlayAudio && !audioPlayedRef.current[item.id] && (
                    <div className="audio-content">
                      <audio 
                        src={item.formatted.file.url}
                        autoPlay={shouldPlayAudio}
                        onPlay={() => {
                          console.log('Audio started playing:', item.id);
                          // Stop any ongoing streaming when file starts playing
                          wavStreamPlayerRef.current.interrupt();
                        }}
                        onEnded={() => {
                          console.log('Audio finished playing:', item.id);
                          audioPlayedRef.current[item.id] = true;
                        }}
                        // Add these attributes to ensure full playback
                        preload="auto"
                        controls={false}
                      />
                    </div>
                  )}
                </>
              ) : (
                !isVoiceChatMode && (
                  <div className="text-content">
                    {item.formatted.transcript || item.formatted.text || ''}
                  </div>
                )
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
