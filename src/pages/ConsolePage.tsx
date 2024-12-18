import { useEffect, useRef, useCallback, useState } from 'react';
import { OpenAI } from 'openai';

import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { instructions } from '../utils/conversation_config.js';
import { WavRenderer } from '../utils/wav_renderer';

import { X, Edit, Zap } from 'react-feather';
import { Button } from '../components/button/Button';
import { Toggle } from '../components/toggle/Toggle';

import './ConsolePage.scss';

import ReactMarkdown from 'react-markdown';

const LOCAL_RELAY_SERVER_URL = process.env.REACT_APP_RELAY_SERVER_URL || '';

export function ConsolePage() {
  /**
   * Ask user for API Key
   * If we're using the local relay server, we don't need this
   */
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || localStorage.getItem('tmp::voice_api_key') || '';

  if (!LOCAL_RELAY_SERVER_URL && !apiKey) {
    const promptedKey = prompt('OpenAI API Key');
    if (promptedKey) {
      localStorage.setItem('tmp::voice_api_key', promptedKey);
      window.location.reload();
    }
  }

  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : {
            apiKey: apiKey,
            dangerouslyAllowAPIKeyInBrowser: true
          }
    )
  );

  /**
   * References for rendering audio visualization (canvas)
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - memoryKv is for set_memory() function
   * - isTextInputMode determines if text input mode is active
   */
  const [items, setItems] = useState<ItemType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});
  const [isTextInputMode, setIsTextInputMode] = useState(false);
  const [userInput, setUserInput] = useState('');

  /**
   * When you click the API key
   */
  const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.clear();
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);

  /**
   * Connect to conversation:
   * WavRecorder takes speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set state variables
    setIsConnected(true);
    setItems(client.conversation.getItems());

    // Connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();

    // Connect to realtime API
    await client.connect();
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`,
      },
    ]);

    if (client.getTurnDetectionType() === 'server_vad') {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
  }, []);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setItems([]);
    setMemoryKv({});

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // First check if we're already recording and pause if needed
    if (wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }

    setIsRecording(true);
    
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

  /**
   * Toggle between text input and voice input modes
   */
  const toggleInputMode = () => {
    setIsTextInputMode((prevMode) => !prevMode);
  };

  /**
   * Handle text input submission
   */
  const handleTextInputSubmit = async () => {
    if (userInput.trim() === '') return;

    const client = clientRef.current;
    
    // Connect to the conversation if not already connected
    if (!isConnected) {
      await connectConversation();
    }

    // Send the message through RealtimeClient
    client.sendUserMessageContent([
      {
        type: 'input_text',
        text: userInput,
      },
    ]);

    setUserInput('');
  };

  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });
    if (value === 'server_vad' && client.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
    setCanPushToTalk(value === 'none');
  };

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#0099ff',
              10,
              0,
              8
            );
          }
        }
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#009900',
              10,
              0,
              8
            );
          }
        }
        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, []);

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;
  
    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });
  
    // Add tools
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves important data about the user into memory.',
        parameters: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'The key of the memory value. Always use lowercase and underscores, no other characters.',
            },
            value: {
              type: 'string',
              description: 'Value can be anything represented as a string',
            },
          },
          required: ['key', 'value'],
        },
      },
      async ({ key, value }: { [key: string]: any }) => {
        setMemoryKv((memoryKv) => {
          const newKv = { ...memoryKv };
          newKv[key] = value;
          return newKv;
        });
        return { ok: true };
      }
    );
  
    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
  
    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (
        item.role === 'assistant' &&
        item.status === 'completed' &&
        (item.formatted.text || item.formatted.transcript) // 确保有文本数据
      ) {
        if (!item.formatted.text && item.formatted.transcript) {
          item.formatted.text = item.formatted.transcript;
      }
      // 确保 item 包含了文本内容或音频内容
        if (item.formatted.text || item.formatted.audio?.length) {
          setItems([...items]);
        }
      }
    });
  
    setItems(client.conversation.getItems());
  
    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);


  /**
   * Render the application
   */
  return (
    <div data-component="ConsolePage">
      <div className="content-top">
        <div className="content-title">
          <img src="/openai-logomark.svg" />
          <span>realtime console</span>
        </div>
        <div className="content-api-key">
          {!LOCAL_RELAY_SERVER_URL && (
            <Button
              icon={Edit}
              iconPosition="end"
              buttonStyle="flush"
              label={`api key: ${apiKey.slice(0, 3)}...`}
              onClick={() => resetAPIKey()}
            />
          )}
        </div>
      </div>
      <div className="content-main">
        <div className="content-block conversation" style={{ gridArea: 'conversation' }}>
          <div className="content-block-title">conversation</div>
          <div className="content-block-body" data-conversation-content>
            {!items.length && `awaiting connection...`}
            {items.map((conversationItem, i) => {
              return (
                <div className="conversation-item" key={conversationItem.id}>
                  <div className={`speaker ${conversationItem.role || ''}`}>
                    <div>
                      {(
                        conversationItem.role || conversationItem.type
                      ).replaceAll('_', ' ')}
                    </div>
                    <div
                      className="close"
                      onClick={() =>
                        deleteConversationItem(conversationItem.id)
                      }
                    >
                      <X />
                    </div>
                  </div>
                  <div className={`speaker-content`}>
                    {/* tool response */}
                    {conversationItem.type === 'function_call_output' && (
                      <div>{conversationItem.formatted.output}</div>
                    )}
                    {/* tool call */}
                    {!!conversationItem.formatted.tool && (
                      <div>
                        {conversationItem.formatted.tool.name}(
                        {conversationItem.formatted.tool.arguments})
                      </div>
                    )}
                    {!conversationItem.formatted.tool &&
                      conversationItem.role === 'user' && (
                        <div>
                          {conversationItem.formatted.transcript ||
                            (conversationItem.formatted.audio?.length
                              ? '(awaiting transcript)'
                              : conversationItem.formatted.text ||
                                '(item sent)')}
                        </div>
                      )}
                    {!conversationItem.formatted.tool &&
                      conversationItem.role === 'assistant' && (
                        <div className="markdown-content">
                          <ReactMarkdown>
                            {conversationItem.formatted.transcript ||
                              conversationItem.formatted.text ||
                              '(truncated)'}
                          </ReactMarkdown>
                        </div>
                      )}
                    {conversationItem.formatted.file && (
                      <div className="audio-content">
                        <audio
                          src={conversationItem.formatted.file.url}
                          controls
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="content-logs" style={{ gridArea: 'logs' }}>
          <div className="content-actions" style={{ gridArea: 'actions', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="controls-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {!isTextInputMode && (
                <Toggle
                  defaultValue={false}
                  labels={['manual', 'vad']}
                  values={['none', 'server_vad']}
                  onChange={(_, value) => changeTurnEndType(value)}
                />
              )}
              <Button
                label={isConnected ? 'disconnect' : 'connect'}
                iconPosition={isConnected ? 'end' : 'start'}
                icon={isConnected ? X : Zap}
                buttonStyle={isConnected ? 'regular' : 'action'}
                onClick={
                  isConnected ? disconnectConversation : connectConversation
                }
              />
            </div>
            {isConnected && canPushToTalk && !isTextInputMode && (
              <Button
                label="Push to Talk"
                icon={Zap}
                iconPosition="start"
                buttonStyle="action"
                disabled={!isConnected || !canPushToTalk}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
              />
            )}
            <Button
              label={isTextInputMode ? 'Switch to Voice Input' : 'Switch to Text Input'}
              onClick={toggleInputMode}
              buttonStyle="action"
            />
          </div>
          <div className="content-block kv" style={{ gridArea: 'kv' }}>
            <div className="content-block-title">set_memory()</div>
            <div className="content-block-body content-kv">
              {JSON.stringify(memoryKv, null, 2)}
            </div>
          </div>
        </div>
        <div className="content-input" style={{ gridArea: 'input', padding: '16px' }}>
          {isTextInputMode && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextInputSubmit();
                  }
                }}
                placeholder="Type your message here..."
                style={{ flexGrow: 1, padding: '8px' }}
              />
              <Button
                label="Send"
                onClick={handleTextInputSubmit}
                buttonStyle="action"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
