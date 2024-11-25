<template>
    <div class="mobile-console">
      <header class="mobile-header">
        <button @click="resetConversation" class="end-chat-button">
          <XIcon size="20" />
          <span>End Chat</span>
        </button>
        <img src="/openai-logomark.svg" alt="OpenAI Logo" />
        <h1>AITA Assistant</h1>
      </header>
  
      <main ref="chatContainerRef" :class="['chat-container', { 'voice-mode': isVoiceChatMode }]">
        <div v-for="item in items" :key="item.id" :class="['message', item.role]">
          <div class="message-content">
            <div v-if="item.role === 'assistant'">
              <div class="text-content">
                <ReactMarkdown :components="markdownComponents">{{ item.formatted.transcript || item.formatted.text || '(truncated)' }}</ReactMarkdown>
              </div>
              <div v-if="item.formatted.file" class="audio-content">
                <audio :src="item.formatted.file.url" controls="false" autoplay @play="onAudioPlay(item.id)" />
              </div>
            </div>
            <div v-else-if="!isVoiceChatMode" class="text-content">
              {{ item.formatted.transcript || item.formatted.text || '' }}
            </div>
          </div>
        </div>
      </main>
  
      <div v-if="previewImage" class="image-preview-modal" @click="closePreview">
        <div class="preview-content" @click.stop>
          <button class="close-preview" @click="closePreview">
            <XIcon size="24" />
          </button>
          <img :src="previewImage" alt="Preview" />
        </div>
      </div>
  
      <div v-if="isVoiceChatMode" class="voice-mode-container">
        <button @click="endVoiceChat" class="hang-off-button">
          <XIcon size="20" />
          End Voice Chat
        </button>
      </div>
      <footer v-else class="input-container">
        <input
          type="text"
          v-model="userInput"
          placeholder="Type a message..."
          @keydown.enter="handleTextInputSubmit"
        />
        <button @click="handleTextInputSubmit" class="send-button">
          <SendIcon size="20" />
        </button>
        <button @click="startVoiceChat" class="mic-button">
          <MicIcon size="20" />
        </button>
      </footer>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, reactive } from 'vue';
  import { RealtimeClient } from '@openai/realtime-api-beta';
  import { WavRecorder, WavStreamPlayer } from '../../lib/wavtools/index.js';
  import { instructions } from '../../utils/conversation_config.js';
  import { XIcon, SendIcon, MicIcon } from 'vue-feather-icons';
  import ReactMarkdown from 'react-markdown';
  
  const LOCAL_RELAY_SERVER_URL = process.env.VUE_APP_RELAY_SERVER_URL || '';
  
  export default {
    name: 'MobileConsolePage',
    components: {
      ReactMarkdown,
      XIcon,
      SendIcon,
      MicIcon,
    },
    setup() {
      const wavRecorderRef = ref(new WavRecorder({ sampleRate: 24000 }));
      const wavStreamPlayerRef = ref(new WavStreamPlayer({ sampleRate: 24000 }));
      const clientRef = ref(new RealtimeClient(
        LOCAL_RELAY_SERVER_URL
          ? { url: LOCAL_RELAY_SERVER_URL }
          : { apiKey: process.env.VUE_APP_OPENAI_API_KEY || '', dangerouslyAllowAPIKeyInBrowser: true }
      ));
  
      const items = ref([]);
      const isConnected = ref(false);
      const isRecording = ref(false);
      const userInput = ref('');
      const showVoiceButton = ref(true);
      const isVoiceChatMode = ref(false);
      const shouldPlayAudio = ref(true);
      const previewImage = ref(null);
  
      const chatContainerRef = ref(null);
      const audioPlayedRef = ref({});
      const streamingAudioRef = ref({});
      const processingAudioRef = ref({});
  
      const markdownComponents = reactive({
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            @click="(e) => handleImageClick(e, src || '')"
            style="cursor: 'pointer'; maxWidth: '100%';"
          />
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            @click="(e) => {
              e.preventDefault();
              if (href?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                previewImage.value = href;
              } else {
                window.open(href, '_blank');
              }
            }}"
          >
            {children}
          </a>
        ),
      });
  
      onMounted(() => {
        connectConversation();
      });
  
      const connectConversation = async () => {
        const client = clientRef.value;
        const wavRecorder = wavRecorderRef.value;
        const wavStreamPlayer = wavStreamPlayerRef.value;
        try {
          await wavRecorder.begin();
          await wavStreamPlayer.connect();
          await client.connect();
  
          isConnected.value = true;
          items.value = client.conversation.getItems();
        } catch (error) {
          console.error('Error connecting:', error);
          isConnected.value = false;
        }
      };
  
      const handleTextInputSubmit = async () => {
        if (userInput.value.trim() === '') return;
        const client = clientRef.value;
        const wavStreamPlayer = wavStreamPlayerRef.value;
        try {
          if (!isConnected.value) {
            await connectConversation();
          }
          if (!client.isConnected()) {
            await client.connect();
          }
          const trackSampleOffset = await wavStreamPlayer.interrupt();
          if (trackSampleOffset?.trackId) {
            const { trackId, offset } = trackSampleOffset;
            await client.cancelResponse(trackId, offset);
          }
          client.sendUserMessageContent([
            {
              type: 'input_text',
              text: userInput.value,
            },
          ]);
          userInput.value = '';
        } catch (error) {
          console.error('Error sending message:', error);
        }
      };
  
      const startVoiceChat = async () => {
        try {
          const client = clientRef.value;
          const wavRecorder = wavRecorderRef.value;
  
          isVoiceChatMode.value = true;
          if (!isConnected.value) {
            await connectConversation();
          }
          if (!client.isConnected()) {
            await client.connect();
          }
          client.updateSession({
            turn_detection: { type: 'server_vad' },
          });
          if (wavRecorder.getStatus() === 'ended') {
            await wavRecorder.begin();
          }
          isRecording.value = true;
          await wavRecorder.record((data) => {
            if (client.isConnected()) {
              client.appendInputAudio(data.mono);
            }
          });
        } catch (error) {
          console.error('Error starting voice chat:', error);
          isVoiceChatMode.value = false;
          isRecording.value = false;
          shouldPlayAudio.value = false;
        }
      };
  
      const endVoiceChat = async () => {
        const client = clientRef.value;
        const wavRecorder = wavRecorderRef.value;
        const wavStreamPlayer = wavStreamPlayerRef.value;
  
        isVoiceChatMode.value = false;
        isRecording.value = false;
        shouldPlayAudio.value = false;
        audioPlayedRef.value = {};
        streamingAudioRef.value = {};
        client.updateSession({ turn_detection: null });
        await wavRecorder.pause();
        await wavRecorder.end();
        await wavStreamPlayer.interrupt();
      };
  
      const resetConversation = async () => {
        const client = clientRef.value;
        const wavRecorder = wavRecorderRef.value;
        const wavStreamPlayer = wavStreamPlayerRef.value;
        try {
          if (wavRecorder.getStatus() !== 'ended') {
            if (isRecording.value) {
              await wavRecorder.pause();
            }
            await wavRecorder.end();
          }
          await wavStreamPlayer.interrupt();
          isVoiceChatMode.value = false;
          isRecording.value = false;
          shouldPlayAudio.value = true;
          isConnected.value = false;
          userInput.value = '';
          items.value = [];
          audioPlayedRef.value = {};
          streamingAudioRef.value = {};
          client.reset();
          await new Promise((resolve) => setTimeout(resolve, 100));
          await connectConversation();
        } catch (error) {
          console.error('Error resetting conversation:', error);
          try {
            await connectConversation();
          } catch (reconnectError) {
            console.error('Error reconnecting:', reconnectError);
          }
        }
      };
  
      const onAudioPlay = (id) => {
        console.log('Audio started playing:', id);
        wavStreamPlayerRef.value.interrupt();
      };
  
      const closePreview = () => {
        previewImage.value = null;
      };
  
      return {
        items,
        isVoiceChatMode,
        userInput,
        previewImage,
        connectConversation,
        handleTextInputSubmit,
        startVoiceChat,
        endVoiceChat,
        resetConversation,
        closePreview,
        markdownComponents,
        onAudioPlay,
        chatContainerRef,
      };
    },
  };
  </script>
  
  <style scoped>
  .mobile-console {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f5f5f5;
    
      // Header styles
      .mobile-header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background-color: #ffffff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        position: relative;
        
        .end-chat-button {
          position: absolute;
          left: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 16px;
          background-color: #ff3b30;
          color: white;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          min-width: 40px;
          justify-content: center;
  
          span {
            @media (max-width: 360px) {
              display: none;
            }
          }
  
          &:active {
            background-color: #d63029;
          }
        }
    
        img {
          height: 24px;
          width: 24px;
          margin: 0 1rem;
        }
    
        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
        }
      }
    
      // Main Chat Content
      .chat-container {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        padding-bottom: 80px;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
    
        &::after {
          content: '';
          display: block;
          height: 20px;
        }
    
        .message {
          margin-bottom: 1.5rem;
          max-width: 85%;
    
          &.user {
            margin-left: auto;
            .message-content {
              background-color: #0084ff;
              color: white;
              border-radius: 18px 18px 4px 18px;
            }
          }
    
          &.assistant {
            margin-right: auto;
            .message-content {
              background-color: #ffffff;
              border-radius: 18px 18px 18px 4px;
            }
          }
    
          .message-content {
            padding: 0.75rem 1rem;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            
            .text-content {
              margin-bottom: 0.5rem;
              position: relative;
              
              p {
                margin: 0;
                white-space: pre-wrap;
              }
            }
            
            .audio-content {
              margin-top: 0.5rem;
              
              audio {
                width: 100%;
                height: 32px;
              }
            }
          }
        }
    
        &.voice-mode {
          .message {
            &.user {
              display: none;
            }
          }
        }
    
        .current-transcript {
          position: fixed;
          bottom: 80px;
          left: 0;
          right: 0;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.05);
          text-align: center;
          
          p {
            margin: 0;
            color: #666;
          }
        }
      }
    
      // Voice Button Section
      .voice-button-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1rem;
        button {
          width: 80px;
          height: 80px;
          background-color: #ffffff;
          border-radius: 50%;
          border: 2px solid #e5e5e5;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
    
          &:active {
            background-color: #f0f0f0;
          }
        }
      }
    
      // Footer input container
      .input-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background-color: #ffffff;
        border-top: 1px solid #e5e5e5;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
    
        input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e5e5e5;
          border-radius: 24px;
          font-size: 1rem;
          outline: none;
          background-color: #f8f8f8;
    
          &:focus {
            border-color: #0084ff;
            background-color: #ffffff;
          }
        }
    
        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background-color: transparent;
          cursor: pointer;
          transition: background-color 0.2s;
    
          &:active {
            background-color: #f0f0f0;
          }
    
          &.send-button {
            color: #0084ff;
          }
    
          &.mic-button {
            color: #666666;
    
            &.recording {
              color: #ff3b30;
              background-color: #ffe5e5;
              animation: pulse 1.5s infinite;
            }
          }
        }
      }
    }
    
    // Animation for recording pulse
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
    
    // Utility classes
    .hidden {
      display: none;
    }
    
    // iOS-specific fixes
    @supports (-webkit-touch-callout: none) {
      .mobile-console {
        .chat-container {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .input-container {
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
        }
      }
    }
    
    .voice-mode-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background-color: #ffffff;
      border-top: 1px solid #e5e5e5;
      display: flex;
      justify-content: center;
      z-index: 100;
  
      .hang-off-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 2rem;
        border-radius: 24px;
        background-color: #ff3b30;
        color: white;
        border: none;
        font-size: 1rem;
        font-weight: 500;
  
        &:active {
          background-color: #d63029;
        }
      }
    }
    
    .image-preview-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
  
      .preview-content {
        position: relative;
        max-width: 90%;
        max-height: 80vh;
        
        img {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
        }
      }
  
      .close-preview {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        padding: 8px;
        cursor: pointer;
        
        &:active {
          opacity: 0.7;
        }
      }
    }
    
  </style>  