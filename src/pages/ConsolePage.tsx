/**
 * Running a local relay server will allow you to hide your API key
 * and run custom logic on the server
 *
 * Set the local relay server address to:
 * REACT_APP_LOCAL_RELAY_SERVER_URL=http://localhost:8081
 *
 * This will also require you to set OPENAI_API_KEY= in a `.env` file
 * You can run it with `npm run relay`, in parallel with `npm start`
 */
const LOCAL_RELAY_SERVER_URL: string =
  process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';

import { useEffect, useRef, useCallback, useState } from 'react';

import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { instructions } from '../utils/conversation_config.js';
import { WavRenderer } from '../utils/wav_renderer';

import { X, Edit, Zap, ArrowUp, ArrowDown } from 'react-feather';
import { Button } from '../components/button/Button';
import { Toggle } from '../components/toggle/Toggle';

import './ConsolePage.scss';
import { isJsxOpeningLikeElement } from 'typescript';

/**
 * Type for result from get_weather() function call
 */
interface Coordinates {
  lat: number;
  lng: number;
  location?: string;
  temperature?: {
    value: number;
    units: string;
  };
  wind_speed?: {
    value: number;
    units: string;
  };
}

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

// 定义参数类型
interface MemoryParams {
  key: string;
  value: string;
}

export function ConsolePage() {
  /**
   * Ask user for API Key
   * If we're using the local relay server, we don't need this
   */
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';

  if (!LOCAL_RELAY_SERVER_URL && !apiKey) {
    console.error('OpenAI API Key is required. Please set it in the .env file.');
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
            dangerouslyAllowAPIKeyInBrowser: true,
          }
    )
  );

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory() function
   * - coords, marker are for get_weather() function
   */
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recorderInitializedRef = useRef(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);

  const toolAddedRef = useRef(false);

  /**
   * Utility for formatting the timing of logs
   */
  const formatTime = useCallback((timestamp: string) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n: number) => {
      let s = n + '';
      while (s.length < 2) {
        s = '0' + s;
      }
      return s;
    };
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    console.log('Connecting to Realtime API...');

    try {
      // Connect to audio output
      await wavStreamPlayer.connect();

      // Connect to Realtime API
      await client.connect();
      console.log('Connected to Realtime API successfully.');

      // Now that we're connected, set state variables
      startTimeRef.current = new Date().toISOString();
      setIsConnected(true);
      setRealtimeEvents([]);
      setItems(client.conversation.getItems());

      // 如果语音模式已经开启，开始录音
      if (isVoiceMode) {
        const wavRecorder = wavRecorderRef.current;
        if (wavRecorder.getStatus() === 'ended') {
          await wavRecorder.begin();
        }
        await wavRecorder.record((data) => handleAudioInput(data));
      }

      client.sendUserMessageContent([
        {
          type: `input_text`,
          text: `你好！`,
        },
      ]);
    } catch (error) {
      console.error('Failed to connect to Realtime API:', error);
    }
  }, [isVoiceMode]);

  const handleAudioInput = useCallback((data: { mono: Int16Array; raw: Int16Array }) => {
    const client = clientRef.current;
    try {
      if (client.realtime?.isConnected()) {
        client.appendInputAudio(data.mono);
        console.log('Audio data sent:', data.mono.length);
      } else {
        console.warn('Client is not connected. Audio data not sent.');
      }
    } catch (error) {
      console.error('Error appending input audio:', error);
    }
  }, []);

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;

    try {
      if (wavRecorder.getStatus() === 'recording') {
        console.log('Stopping recording...');
        // Check if client is connected before pausing
        const isClientConnected = client.realtime?.isConnected();
        if (isClientConnected) {
          await wavRecorder.pause();
        } else {
          console.warn('Client is not connected. Skipping wavRecorder.pause().');
        }
        setIsRecording(false);
        recorderInitializedRef.current = false;
        console.log('Recording stopped successfully.');
      } else {
        console.warn('Recorder is not recording. No need to stop.');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    // First, stop recording if necessary
    if (isRecording) {
      await stopRecording();
    }

    setIsVoiceMode(false);
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);

    const client = clientRef.current;

    // Now disconnect the client
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    if (wavRecorder.getStatus() !== 'ended') {
      await wavRecorder.end();
    }

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, [isRecording, stopRecording]);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;

    if (!client.isConnected()) {
      console.warn('Client is not connected. Cannot start recording.');
      return;
    }

    if (recorderInitializedRef.current) {
      console.warn('Recorder is already initialized.');
      return;
    }

    try {
      console.log('Recorder status before starting:', wavRecorder.getStatus());

      if (wavRecorder.getStatus() === 'ended') {
        await wavRecorder.begin();
      }

      console.log('Starting recording...');
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));

      setIsRecording(true);
      recorderInitializedRef.current = true;
      console.log('Recording started successfully.');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;

    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });

    setCanPushToTalk(value === 'none');
  };

  /**
   * Auto-scroll the event logs
   */
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  /**
   * Auto-scroll the conversation logs
   */
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

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
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    if (!toolAddedRef.current) {
      client.updateSession({
        instructions: instructions,
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { type: 'server_vad' },
        voice: 'alloy',
        output_audio_format: 'pcm16',
      });

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
        async ({ key, value }: MemoryParams) => {
          console.log(`Memory updated: ${key} = ${value}`);
          return { ok: true };
        }
      );

      client.addTool(
        {
          name: 'search_wikipedia',
          description: '在维基百科上搜索给定的查询并返回摘要',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '要搜索的关键词或短语。',
              },
            },
            required: ['query'],
          },
        },
        async ({ query }: { query: string }) => {
          try {
            const response = await fetch(
              `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.extract) {
                return { summary: data.extract };
              } else {
                return { summary: `抱歉，我在维基百科中找不到与"${query}"相关的信息。` };
              }
            } else {
              return { summary: `抱歉，我无法访问维基百科。` };
            }
          } catch (error) {
            return { summary: `抱歉，搜索时出现错误。` };
          }
        }
      );

      toolAddedRef.current = true;
    }

    // 监听会话更新事件
    const conversationUpdateHandler = ({ item, delta }: any) => {
      console.log('Conversation updated:', item, delta);
      
      // 如果助手的回复包含音频数据
      if (item.role === 'assistant' && delta && delta.audio) {
        console.log('Received assistant audio delta:', delta.audio);

        // 将音频数据传递给 wavStreamPlayer
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }

      setItems(client.conversation.getItems());
    };

    // 监听 conversation.interrupted 事件，处理中断
    const conversationInterruptedHandler = async () => {
      console.log('Conversation interrupted by user speaking.');

      // 中断助手的音频播放
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    };

    // 添加事件监听器
    const eventHandler = (event: any) => {
      console.log('Received event:', event);
      setRealtimeEvents((prevEvents) => {
        const newEvents = [
          ...prevEvents,
          {
            time: new Date().toISOString(),
            source: 'server' as const,
            event,
          },
        ];
        console.log('Updated realtimeEvents:', newEvents);
        return newEvents;
      });
    };

    client.on('conversation.updated', conversationUpdateHandler);
    client.on('conversation.interrupted', conversationInterruptedHandler);
    client.on('event', eventHandler);

    // 在组件卸载时移除监听器和工具
    return () => {
      client.off('conversation.updated', conversationUpdateHandler);
      client.off('conversation.interrupted', conversationInterruptedHandler);
      client.off('event', eventHandler);
      client.removeTool('set_memory');
      client.removeTool('search_wikipedia');
    };
  }, []);

  // 添加用户交互后激活音频上下文的代码
  useEffect(() => {
    const handleUserInteraction = async () => {
      const wavStreamPlayer = wavStreamPlayerRef.current;
      if (wavStreamPlayer.context && wavStreamPlayer.context.state === 'suspended') {
        await wavStreamPlayer.context.resume();
        console.log('Audio context resumed');
      }
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;

    const handleAudioInput = (data: { mono: Int16Array; raw: Int16Array }) => {
      try {
        const isClientConnected = client.realtime?.isConnected();
        if (isClientConnected) {
          client.appendInputAudio(data.mono);
        } else {
          console.warn('Client is not connected. Audio data not sent.');
        }
      } catch (error) {
        console.error('Error appending input audio:', error);
      }
    };

    if (isConnected && isVoiceMode && !isRecording) {
      startRecording();
    } else if (!isVoiceMode || !isConnected) {
      stopRecording();
    }

    return () => {
      // 清理逻辑（如果需要）
    };
  }, [isConnected, isVoiceMode, isRecording]);

  useEffect(() => {
    const client = clientRef.current;

    client.updateSession({
      instructions: instructions,
      input_audio_transcription: { model: 'whisper-1' },
      turn_detection: { type: 'server_vad' },
    });

    // 添加事件监听器
    const eventHandler = (event: any) => {
      console.log('Received event:', event);
      setRealtimeEvents((prevEvents) => {
        const newEvents = [
          ...prevEvents,
          {
            time: new Date().toISOString(),
            source: 'server' as const,
            event,
          },
        ];
        console.log('Updated realtimeEvents:', newEvents);
        return newEvents;
      });
    };

    const conversationUpdateHandler = ({ item, delta }: any) => {
      console.log('Conversation updated:', item, delta);
      setItems(client.conversation.getItems());
    };

    client.on('event', eventHandler);
    client.on('conversation.updated', conversationUpdateHandler);

    // 自动连接
    connectConversation();

    // 在组件卸载时断开连接和移除监听器
    return () => {
      client.off('event', eventHandler);
      client.off('conversation.updated', conversationUpdateHandler);
      client.disconnect();
    };
  }, [connectConversation]);

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
        {/* 可选地显示部分 API 密钥 */}
        {!LOCAL_RELAY_SERVER_URL && (
          <div className="content-api-key">
            <span>api key: {`${apiKey.slice(0, 3)}...`}</span>
          </div>
        )}
      </div>
      <div className="content-main">
        <div className="content-logs">
          <div className="content-block events">
            <div className="visualization">
              <div className="visualization-entry client">
                <canvas ref={clientCanvasRef} />
              </div>
              <div className="visualization-entry server">
                <canvas ref={serverCanvasRef} />
              </div>
            </div>
            <div className="content-block-title">events</div>
            <div className="content-block-body" ref={eventsScrollRef}>
              {!realtimeEvents.length && `awaiting connection...`}
              {realtimeEvents.map((realtimeEvent: RealtimeEvent, i: number) => {
                const count = realtimeEvent.count;
                const event = { ...realtimeEvent.event };
                if (event.type === 'input_audio_buffer.append') {
                  event.audio = `[trimmed: ${event.audio.length} bytes]`;
                } else if (event.type === 'response.audio.delta') {
                  event.delta = `[trimmed: ${event.delta.length} bytes]`;
                }
                return (
                  <div className="event" key={event.event_id}>
                    <div className="event-timestamp">
                      {formatTime(realtimeEvent.time)}
                    </div>
                    <div className="event-details">
                      <div
                        className="event-summary"
                        onClick={() => {
                          // toggle event details
                          const id = event.event_id;
                          const expanded = { ...expandedEvents };
                          if (expanded[id]) {
                            delete expanded[id];
                          } else {
                            expanded[id] = true;
                          }
                          setExpandedEvents(expanded);
                        }}
                      >
                        <div
                          className={`event-source ${
                            event.type === 'error'
                              ? 'error'
                              : realtimeEvent.source
                          }`}
                        >
                          {realtimeEvent.source === 'client' ? (
                            <ArrowUp />
                          ) : (
                            <ArrowDown />
                          )}
                          <span>
                            {event.type === 'error'
                              ? 'error!'
                              : realtimeEvent.source}
                          </span>
                        </div>
                        <div className="event-type">
                          {event.type}
                          {count && ` (${count})`}
                        </div>
                      </div>
                      {!!expandedEvents[event.event_id] && (
                        <div className="event-payload">
                          {JSON.stringify(event, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="content-block conversation">
            <div className="content-block-title">conversation</div>
            <div className="content-block-body" data-conversation-content>
              {!items.length && `awaiting connection...`}
              {items.map((conversationItem: ItemType, i: number) => {
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
                          <div>
                            {conversationItem.formatted.transcript ||
                              conversationItem.formatted.text ||
                              '(truncated)'}
                          </div>
                        )}
                      {conversationItem.formatted.file && (
                        <audio
                          src={conversationItem.formatted.file.url}
                          controls
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="content-actions">
            <Toggle
              defaultValue={true}
              labels={['VAD On', 'VAD Off']}
              values={['server_vad', 'none']}
              onChange={(_, value) => changeTurnEndType(value)}
            />
            <div className="spacer" />
            {isConnected && canPushToTalk && (
              <Button
                label={isRecording ? 'release to send' : 'push to talk'}
                buttonStyle={isRecording ? 'alert' : 'regular'}
                disabled={!isConnected || !canPushToTalk}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
              />
            )}
            <div className="spacer" />
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
        </div>
        <div className="content-right">
          <div className="content-block map">
            <div className="content-block-title">get_weather()</div>
            <div className="content-block-title bottom">
              {/* Removed Map component */}
              {/* {coords && (
                <Map
                  center={[coords.lat, coords.lng]}
                  location={coords.location}
                />
              )} */}
            </div>
            <div className="content-block-body full">
              {/* Removed Map component */}
              {/* {coords && (
                <Map
                  center={[coords.lat, coords.lng]}
                  location={coords.location}
                />
              )} */}
            </div>
          </div>
        </div>
      </div>
      {isVoiceMode && (
        <div className="voice-indicator">
          <div className="voice-ball"></div>
        </div>
      )}
      <Button
        label={isVoiceMode ? '关闭语音式' : '开启语音模式'}
        onClick={() => setIsVoiceMode(!isVoiceMode)}
        disabled={!isConnected}
      />
    </div>
  );
}
