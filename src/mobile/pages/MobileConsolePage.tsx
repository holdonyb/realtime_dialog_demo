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

// 定义 API 响应的接口
interface TeacherClass {
  id: number;
  description: string;
  name: string;
  im_group_id: string;
  example_class: boolean;
  im_group_msg: string | null;
  im_group_time: string | null;
  code_url: string;
  code_url_online: string;
  school_id: number | null;
  grade_id: number;
  iswork: boolean;
  headmaster_id: string;
  subject_id: number;
  subject_text: string;
  class_avator: string;
  create_time: string;
  update_time: string;
}

interface TeacherClassesResponse {
  data: TeacherClass[];
  code: number;
  msg: string;
}

// 添加新的接口定义
interface TeacherHomework {
  id: number;
  token: string | null;
  organization_id: number;
  class_id: number | null;
  grade_id: number;
  total_score: number | null;
  subject_id: number;
  type: string;
  assignment_type: string;
  file_type: string | null;
  task_id: string | null;
  name: string;
  description: string;
  teacher_id: number;
  is_allow_ai: boolean;
  questions: any[];
  origin_urls: string;
  is_includes_answer: boolean;
  is_generate_answer: boolean;
  start_time: string | null;
  deadline_time: string;
  create_time: string;
  update_time: string;
}

interface TeacherHomeworksResponse {
  data: TeacherHomework[];
  code: number;
  msg: string;
}

// 添加新的接口定义
interface StudentSubmissionStatus {
  user_id: number;
  teacher_id: number;
  class_id: number;
  student_name: string;
  subject_text: string;
  avator: string;
}

// 添加新的接口定义
interface ClassHomework {
  assignment_id: number;
  user_id: number;
  class_id: number;
  score: number;
  prev_score: number;
  content: string;
  token: string;
  feedback: string;
  error_type_summary: string;
  task_id: string;
  post_status: string;
  status: number;
  create_time: string;
  update_time: string;
  isview: number;
}

// 定义工具
const teacherClassesTool = {
  name: 'get_teacher_classes',
  description: 'Retrieves the list of classes taught by a given teacher. The teacher_id should be extracted from the conversation context.',
  parameters: {
    type: 'object',
    properties: {
      teacher_id: {
        type: 'number',
        description: 'The numeric identifier of the teacher',
      },
    },
    required: ['teacher_id'],
  },
};

// 定义新工具
const teacherIncompleteHomeworksTool = {
  name: 'get_teacher_incomplete_homeworks',
  description: 'Retrieves the list of incomplete homework assignments for a given teacher. The teacher_id should be extracted from the conversation context.',
  parameters: {
    type: 'object',
    properties: {
      teacher_id: {
        type: 'number',
        description: 'The numeric identifier of the teacher',
      },
    },
    required: ['teacher_id'],
  },
};

// 定义新工具
const checkSubmissionStatusTool = {
  name: 'check_submission_status',
  description: 'Retrieves the list of students who have not submitted their homework for a specific class and homework assignment. Both class_id and homework_id should be extracted from the conversation context.',
  parameters: {
    type: 'object',
    properties: {
      class_id: {
        type: 'number',
        description: 'The numeric identifier of the class',
      },
      homework_id: {
        type: 'number',
        description: 'The numeric identifier of the homework assignment',
      },
    },
    required: ['class_id', 'homework_id'],
  },
};

// 定义新工具
const getClassHomeworksTool = {
  name: 'get_class_homeworks',
  description: 'Retrieves the list of homework assignments for a specific class. Both student_id and class_name should be extracted from the conversation context.',
  parameters: {
    type: 'object',
    properties: {
      student_id: {
        type: 'number',
        description: 'The numeric identifier of the student',
      },
      class_name: {
        type: 'string',
        description: 'The name of the class',
      },
    },
    required: ['student_id', 'class_name'],
  },
};

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

  // Add this new ref to track which messages are currently being processed
  const processingAudioRef = useRef<{[key: string]: boolean}>({});

  // Core functions
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    try {
      // 添加第一个工具（获取班级列表）
      client.addTool(
        teacherClassesTool,
        async (params: { teacher_id: number }) => {
          try {
            const response = await fetch('/api/open/get_teacher_classes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                teacher_id: params.teacher_id 
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error Response:', errorText);
              throw new Error(`Failed to fetch teacher classes: ${response.status}`);
            }

            const result: TeacherClassesResponse = await response.json();
            
            if (result.code !== 0) {
              throw new Error(`API Error: ${result.msg}`);
            }

            return result.data;
          } catch (error) {
            console.error('Error fetching teacher classes:', error);
            return { 
              error: error instanceof Error ? error.message : 'Unable to retrieve teacher classes at this time'
            };
          }
        }
      );

      // 添加第二个工具（获取未完成作业）
      client.addTool(
        teacherIncompleteHomeworksTool,
        async (params: { teacher_id: number }) => {
          try {
            const response = await fetch('/api/open/get_teacher_incomplete_homeworks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                teacher_id: params.teacher_id 
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error Response:', errorText);
              throw new Error(`Failed to fetch incomplete homeworks: ${response.status}`);
            }

            const result: TeacherHomeworksResponse = await response.json();
            
            if (result.code !== 0) {
              throw new Error(`API Error: ${result.msg}`);
            }

            // 格式化截止日期，使其更易读
            const formattedHomeworks = result.data.map(homework => ({
              ...homework,
              deadline_time: new Date(homework.deadline_time).toLocaleDateString(),
              create_time: new Date(homework.create_time).toLocaleDateString(),
            }));

            console.log('Incomplete homeworks retrieved successfully:', formattedHomeworks);
            return formattedHomeworks;
          } catch (error) {
            console.error('Error fetching incomplete homeworks:', error);
            return { 
              error: error instanceof Error ? error.message : 'Unable to retrieve incomplete homeworks at this time'
            };
          }
        }
      );

      // 添加检查作业提交状态的工具
      client.addTool(
        checkSubmissionStatusTool,
        async (params: { class_id: number; homework_id: number }) => {
          try {
            const response = await fetch('/api/open/check_submission_status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                class_id: params.class_id,
                homework_id: params.homework_id
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error Response:', errorText);
              throw new Error(`Failed to fetch submission status: ${response.status}`);
            }

            const result: StudentSubmissionStatus[] = await response.json();
            
            // 添加一些有用的统计信息
            const summary = {
              total_students: result.length,
              students: result,
              summary: `Total ${result.length} students haven't submitted their homework.`
            };

            console.log('Submission status retrieved successfully:', summary);
            return summary;
          } catch (error) {
            console.error('Error checking submission status:', error);
            return { 
              error: error instanceof Error ? 
                error.message : 
                'Unable to retrieve submission status at this time'
            };
          }
        }
      );

      // 添加获取班级作业列表的工具
      client.addTool(
        getClassHomeworksTool,
        async (params: { student_id: number; class_name: string }) => {
          try {
            const response = await fetch('/api/open/get_class_homeworks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                student_id: params.student_id,
                class_name: params.class_name
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error Response:', errorText);
              throw new Error(`Failed to fetch class homeworks: ${response.status}`);
            }

            const result: ClassHomework[] = await response.json();
            
            // 格式化日期添加统计信息
            const formattedHomeworks = result.map(homework => ({
              ...homework,
              create_time: new Date(homework.create_time).toLocaleDateString(),
              update_time: new Date(homework.update_time).toLocaleDateString(),
            }));

            const summary = {
              total_homeworks: formattedHomeworks.length,
              homeworks: formattedHomeworks,
              summary: `Found ${formattedHomeworks.length} homework assignments for this class.`
            };

            console.log('Class homeworks retrieved successfully:', summary);
            return summary;
          } catch (error) {
            console.error('Error fetching class homeworks:', error);
            return { 
              error: error instanceof Error ? 
                error.message : 
                'Unable to retrieve class homeworks at this time'
            };
          }
        }
      );

      // 继续连接过程
      await wavRecorder.begin();
      await wavStreamPlayer.connect();
      await client.connect();
      
      setIsConnected(true);
      setItems(client.conversation.getItems());
    } catch (error) {
      console.error('Error connecting:', error);
      setIsConnected(false);
    }
  }, []);

  const startRecording = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    try {
      if (!isConnected) {
        await connectConversation();
      }

      if (!client.isConnected()) {
        await client.connect();
      }

      // First check if we're already recording and pause if needed
      if (wavRecorder.getStatus() === 'recording') {
        await wavRecorder.pause();
      }

      setIsRecording(true);
      
      // Interrupt any playing audio before starting new recording
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
      
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

  // const stopRecording = async () => {
  //   const client = clientRef.current;
  //   const wavRecorder = wavRecorderRef.current;
    
  //   setIsRecording(false);
    
  //   client.updateSession({
  //     turn_detection: null
  //   });
    
  //   await wavRecorder.pause();
  //   client.createResponse();
  // };

  const handleTextInputSubmit = async () => {
    if (userInput.trim() === '') return;

    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    
    try {
      if (!isConnected) {
        await connectConversation();
      }

      if (!client.isConnected()) {
        await client.connect();
      }

      // 中断当前正在播放的音频
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
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
      }
      
      // 确保 WavRecorder 完全结束当前会话
      await wavRecorder.end();
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
      
      // Reset client
      client.reset();
      
      // 添加一个小延迟确保所有资源都被正确释放
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 重新连接
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

    function handleConversationUpdate({ item, delta }: any) {
      const items = client.conversation.getItems();
      
      // Handle audio streaming
      if (delta?.audio && shouldPlayAudio) {  // 添加 shouldPlayAudio 检查
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
        streamingAudioRef.current[item.id] = true;
      }

      // Handle assistant messages
      if (item.role === 'assistant') {
        if (item.status === 'completed' && 
            (item.formatted.text || item.formatted.transcript)) {
          // Update text content
          if (!item.formatted.text && item.formatted.transcript) {
            item.formatted.text = item.formatted.transcript;
          }
          
          // Only update items if there's content
          if (item.formatted.text || item.formatted.audio?.length) {
            setItems([...items]);
          }

          // Only process audio if it hasn't been processed and isn't currently streaming
          if (item.formatted.audio?.length && 
              !item.formatted.file && 
              !processingAudioRef.current[item.id] &&
              !streamingAudioRef.current[item.id]) {
            processingAudioRef.current[item.id] = true;
            streamingAudioRef.current[item.id] = true; // Mark as streaming
            
            WavRecorder.decode(item.formatted.audio, 24000, 24000)
              .then(wavFile => {
                // Skip file creation if we've already streamed the audio
                if (streamingAudioRef.current[item.id]) {
                  delete processingAudioRef.current[item.id];
                  return;
                }
                item.formatted.file = wavFile;
                setItems([...items]);
              })
              .catch(error => {
                console.error('Error processing audio:', error);
                delete processingAudioRef.current[item.id];
              });
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
  }, [isVoiceChatMode, shouldPlayAudio]);  // 添加 shouldPlayAudio 依赖

  // Add this event handler for conversation interruption
  useEffect(() => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });

    return () => {
      client.off('conversation.interrupted');
    };
  }, []);

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
                  <div className="text-content">
                    <ReactMarkdown>
                      {item.formatted.transcript ||
                        item.formatted.text ||
                        '(truncated)'}
                    </ReactMarkdown>
                  </div>
                  {item.formatted.file && (
                    <div className="audio-content">
                      <audio
                        src={item.formatted.file.url}
                        controls={false}
                        autoPlay={true}
                        onPlay={() => {
                          console.log('Audio started playing:', item.id);
                          wavStreamPlayerRef.current.interrupt();
                        }}
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