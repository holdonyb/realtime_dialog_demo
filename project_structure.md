# 项目文件结构

├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── LICENSE
├── README.md
├── package-lock.json
├── package.json
├── public
│   ├── index.html
│   ├── openai-logomark.svg
│   └── robots.txt
├── readme
│   └── realtime-console-demo.png
├── relay-server
│   ├── index.js
│   └── lib
│       └── relay.js
├── src
│   ├── App.scss
│   ├── App.tsx
│   ├── components
│   │   ├── Map.scss
│   │   ├── Map.tsx
│   │   ├── button
│   │   │   ├── Button.scss
│   │   │   └── Button.tsx
│   │   └── toggle
│   │       ├── Toggle.scss
│   │       └── Toggle.tsx
│   ├── index.css
│   ├── index.tsx
│   ├── lib
│   │   └── wavtools
│   │       ├── dist
│   │       │   ├── index.d.ts
│   │       │   ├── index.d.ts.map
│   │       │   └── lib
│   │       │       ├── analysis
│   │       │       │   ├── audio_analysis.d.ts
│   │       │       │   ├── audio_analysis.d.ts.map
│   │       │       │   ├── constants.d.ts
│   │       │       │   └── constants.d.ts.map
│   │       │       ├── wav_packer.d.ts
│   │       │       ├── wav_packer.d.ts.map
│   │       │       ├── wav_recorder.d.ts
│   │       │       ├── wav_recorder.d.ts.map
│   │       │       ├── wav_stream_player.d.ts
│   │       │       ├── wav_stream_player.d.ts.map
│   │       │       └── worklets
│   │       │           ├── audio_processor.d.ts
│   │       │           ├── audio_processor.d.ts.map
│   │       │           ├── stream_processor.d.ts
│   │       │           └── stream_processor.d.ts.map
│   │       ├── index.js
│   │       └── lib
│   │           ├── analysis
│   │           │   ├── audio_analysis.js
│   │           │   └── constants.js
│   │           ├── wav_packer.js
│   │           ├── wav_recorder.js
│   │           ├── wav_stream_player.js
│   │           └── worklets
│   │               ├── audio_processor.js
│   │               └── stream_processor.js
│   ├── logo.svg
│   ├── pages
│   │   ├── ConsolePage.scss
│   │   └── ConsolePage.tsx
│   ├── react-app-env.d.ts
│   ├── reportWebVitals.ts
│   ├── setupTests.ts
│   └── utils
│       ├── conversation_config.js
│       └── wav_renderer.ts
└── tsconfig.json


# 文件内容

## `.eslintrc.json`

```json
{
  "parserOptions": {
    "sourceType": "module"
  },
  "env": {
    "es2022": true
  }
}

```

## `.gitignore`

```plaintext
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
package-lock.json
# testing
/coverage

# production
/build

# packaging
*.zip
*.tar.gz
*.tar
*.tgz
*.bla

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*


```

## `.prettierrc`

```plaintext
{
  "tabWidth": 2,
  "useTabs": false,
  "singleQuote": true
}

```

## `LICENSE`

```plaintext
MIT License

Copyright (c) 2024 OpenAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## `README.md`

```md
# OpenAI Realtime Console

The OpenAI Realtime Console is intended as an inspector and interactive API reference
for the OpenAI Realtime API. It comes packaged with two utility libraries,
[openai/openai-realtime-api-beta](https://github.com/openai/openai-realtime-api-beta)
that acts as a **Reference Client** (for browser and Node.js) and
[`/src/lib/wavtools`](./src/lib/wavtools) which allows for simple audio
management in the browser.

<img src="/readme/realtime-console-demo.png" width="800" />

# Starting the console

This is a React project created using `create-react-app` that is bundled via Webpack.
Install it by extracting the contents of this package and using;

```shell
$ npm i
```

Start your server with:

```shell
$ npm start
```

It should be available via `localhost:3000`.

# Table of contents

1. [Using the console](#using-the-console)
   1. [Using a relay server](#using-a-relay-server)
1. [Realtime API reference client](#realtime-api-reference-client)
   1. [Sending streaming audio](#sending-streaming-audio)
   1. [Adding and using tools](#adding-and-using-tools)
   1. [Interrupting the model](#interrupting-the-model)
   1. [Reference client events](#reference-client-events)
1. [Wavtools](#wavtools)
   1. [WavRecorder quickstart](#wavrecorder-quickstart)
   1. [WavStreamPlayer quickstart](#wavstreamplayer-quickstart)
1. [Acknowledgements and contact](#acknowledgements-and-contact)

# Using the console

The console requires an OpenAI API key (**user key** or **project key**) that has access to the
Realtime API. You'll be prompted on startup to enter it. It will be saved via `localStorage` and can be
changed at any time from the UI.

To start a session you'll need to **connect**. This will require microphone access.
You can then choose between **manual** (Push-to-talk) and **vad** (Voice Activity Detection)
conversation modes, and switch between them at any time.

There are two functions enabled;

- `get_weather`: Ask for the weather anywhere and the model will do its best to pinpoint the
  location, show it on a map, and get the weather for that location. Note that it doesn't
  have location access, and coordinates are "guessed" from the model's training data so
  accuracy might not be perfect.
- `set_memory`: You can ask the model to remember information for you, and it will store it in
  a JSON blob on the left.

You can freely interrupt the model at any time in push-to-talk or VAD mode.

## Using a relay server

If you would like to build a more robust implementation and play around with the reference
client using your own server, we have included a Node.js [Relay Server](/relay-server/index.js).

```shell
$ npm run relay
```

It will start automatically on `localhost:8081`.

**You will need to create a `.env` file** with the following configuration:

```conf
OPENAI_API_KEY=YOUR_API_KEY
REACT_APP_LOCAL_RELAY_SERVER_URL=http://localhost:8081
```

You will need to restart both your React app and relay server for the `.env.` changes
to take effect. The local server URL is loaded via [`ConsolePage.tsx`](/src/pages/ConsolePage.tsx).
To stop using the relay server at any time, simply delete the environment
variable or set it to empty string.

```javascript
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
```

This server is **only a simple message relay**, but it can be extended to:

- Hide API credentials if you would like to ship an app to play with online
- Handle certain calls you would like to keep secret (e.g. `instructions`) on
  the server directly
- Restrict what types of events the client can receive and send

You will have to implement these features yourself.

# Realtime API reference client

The latest reference client and documentation are available on GitHub at
[openai/openai-realtime-api-beta](https://github.com/openai/openai-realtime-api-beta).

You can use this client yourself in any React (front-end) or Node.js project.
For full documentation, refer to the GitHub repository, but you can use the
guide here as a primer to get started.

```javascript
import { RealtimeClient } from '/src/lib/realtime-api-beta/index.js';

const client = new RealtimeClient({ apiKey: process.env.OPENAI_API_KEY });

// Can set parameters ahead of connecting
client.updateSession({ instructions: 'You are a great, upbeat friend.' });
client.updateSession({ voice: 'alloy' });
client.updateSession({ turn_detection: 'server_vad' });
client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

// Set up event handling
client.on('conversation.updated', ({ item, delta }) => {
  const items = client.conversation.getItems(); // can use this to render all items
  /* includes all changes to conversations, delta may be populated */
});

// Connect to Realtime API
await client.connect();

// Send an item and triggers a generation
client.sendUserMessageContent([{ type: 'text', text: `How are you?` }]);
```

## Sending streaming audio

To send streaming audio, use the `.appendInputAudio()` method. If you're in `turn_detection: 'disabled'` mode,
then you need to use `.generate()` to tell the model to respond.

```javascript
// Send user audio, must be Int16Array or ArrayBuffer
// Default audio format is pcm16 with sample rate of 24,000 Hz
// This populates 1s of noise in 0.1s chunks
for (let i = 0; i < 10; i++) {
  const data = new Int16Array(2400);
  for (let n = 0; n < 2400; n++) {
    const value = Math.floor((Math.random() * 2 - 1) * 0x8000);
    data[n] = value;
  }
  client.appendInputAudio(data);
}
// Pending audio is committed and model is asked to generate
client.createResponse();
```

## Adding and using tools

Working with tools is easy. Just call `.addTool()` and set a callback as the second parameter.
The callback will be executed with the parameters for the tool, and the result will be automatically
sent back to the model.

```javascript
// We can add tools as well, with callbacks specified
client.addTool(
  {
    name: 'get_weather',
    description:
      'Retrieves the weather for a given lat, lng coordinate pair. Specify a label for the location.',
    parameters: {
      type: 'object',
      properties: {
        lat: {
          type: 'number',
          description: 'Latitude',
        },
        lng: {
          type: 'number',
          description: 'Longitude',
        },
        location: {
          type: 'string',
          description: 'Name of the location',
        },
      },
      required: ['lat', 'lng', 'location'],
    },
  },
  async ({ lat, lng, location }) => {
    const result = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`
    );
    const json = await result.json();
    return json;
  }
);
```

## Interrupting the model

You may want to manually interrupt the model, especially in `turn_detection: 'disabled'` mode.
To do this, we can use:

```javascript
// id is the id of the item currently being generated
// sampleCount is the number of audio samples that have been heard by the listener
client.cancelResponse(id, sampleCount);
```

This method will cause the model to immediately cease generation, but also truncate the
item being played by removing all audio after `sampleCount` and clearing the text
response. By using this method you can interrupt the model and prevent it from "remembering"
anything it has generated that is ahead of where the user's state is.

## Reference client events

There are five main client events for application control flow in `RealtimeClient`.
Note that this is only an overview of using the client, the full Realtime API
event specification is considerably larger, if you need more control check out the GitHub repository:
[openai/openai-realtime-api-beta](https://github.com/openai/openai-realtime-api-beta).

```javascript
// errors like connection failures
client.on('error', (event) => {
  // do thing
});

// in VAD mode, the user starts speaking
// we can use this to stop audio playback of a previous response if necessary
client.on('conversation.interrupted', () => {
  /* do something */
});

// includes all changes to conversations
// delta may be populated
client.on('conversation.updated', ({ item, delta }) => {
  // get all items, e.g. if you need to update a chat window
  const items = client.conversation.getItems();
  switch (item.type) {
    case 'message':
      // system, user, or assistant message (item.role)
      break;
    case 'function_call':
      // always a function call from the model
      break;
    case 'function_call_output':
      // always a response from the user / application
      break;
  }
  if (delta) {
    // Only one of the following will be populated for any given event
    // delta.audio = Int16Array, audio added
    // delta.transcript = string, transcript added
    // delta.arguments = string, function arguments added
  }
});

// only triggered after item added to conversation
client.on('conversation.item.appended', ({ item }) => {
  /* item status can be 'in_progress' or 'completed' */
});

// only triggered after item completed in conversation
// will always be triggered after conversation.item.appended
client.on('conversation.item.completed', ({ item }) => {
  /* item status will always be 'completed' */
});
```

# Wavtools

Wavtools contains easy management of PCM16 audio streams in the browser, both
recording and playing.

## WavRecorder Quickstart

```javascript
import { WavRecorder } from '/src/lib/wavtools/index.js';

const wavRecorder = new WavRecorder({ sampleRate: 24000 });
wavRecorder.getStatus(); // "ended"

// request permissions, connect microphone
await wavRecorder.begin();
wavRecorder.getStatus(); // "paused"

// Start recording
// This callback will be triggered in chunks of 8192 samples by default
// { mono, raw } are Int16Array (PCM16) mono & full channel data
await wavRecorder.record((data) => {
  const { mono, raw } = data;
});
wavRecorder.getStatus(); // "recording"

// Stop recording
await wavRecorder.pause();
wavRecorder.getStatus(); // "paused"

// outputs "audio/wav" audio file
const audio = await wavRecorder.save();

// clears current audio buffer and starts recording
await wavRecorder.clear();
await wavRecorder.record();

// get data for visualization
const frequencyData = wavRecorder.getFrequencies();

// Stop recording, disconnects microphone, output file
await wavRecorder.pause();
const finalAudio = await wavRecorder.end();

// Listen for device change; e.g. if somebody disconnects a microphone
// deviceList is array of MediaDeviceInfo[] + `default` property
wavRecorder.listenForDeviceChange((deviceList) => {});
```

## WavStreamPlayer Quickstart

```javascript
import { WavStreamPlayer } from '/src/lib/wavtools/index.js';

const wavStreamPlayer = new WavStreamPlayer({ sampleRate: 24000 });

// Connect to audio output
await wavStreamPlayer.connect();

// Create 1s of empty PCM16 audio
const audio = new Int16Array(24000);
// Queue 3s of audio, will start playing immediately
wavStreamPlayer.add16BitPCM(audio, 'my-track');
wavStreamPlayer.add16BitPCM(audio, 'my-track');
wavStreamPlayer.add16BitPCM(audio, 'my-track');

// get data for visualization
const frequencyData = wavStreamPlayer.getFrequencies();

// Interrupt the audio (halt playback) at any time
// To restart, need to call .add16BitPCM() again
const trackOffset = await wavStreamPlayer.interrupt();
trackOffset.trackId; // "my-track"
trackOffset.offset; // sample number
trackOffset.currentTime; // time in track
```

# Acknowledgements and contact

Thanks for checking out the Realtime Console. We hope you have fun with the Realtime API.
Special thanks to the whole Realtime API team for making this possible. Please feel free
to reach out, ask questions, or give feedback by creating an issue on the repository.
You can also reach out and let us know what you think directly!

- OpenAI Developers / [@OpenAIDevs](https://x.com/OpenAIDevs)
- Jordan Sitkin / API / [@dustmason](https://x.com/dustmason)
- Mark Hudnall / API / [@landakram](https://x.com/landakram)
- Peter Bakkum / API / [@pbbakkum](https://x.com/pbbakkum)
- Atty Eleti / API / [@athyuttamre](https://x.com/athyuttamre)
- Jason Clark / API / [@onebitToo](https://x.com/onebitToo)
- Karolis Kosas / Design / [@karoliskosas](https://x.com/karoliskosas)
- Keith Horwood / API + DX / [@keithwhor](https://x.com/keithwhor)
- Romain Huet / DX / [@romainhuet](https://x.com/romainhuet)
- Katia Gil Guzman / DX / [@kagigz](https://x.com/kagigz)
- Ilan Bigio / DX / [@ilanbigio](https://x.com/ilanbigio)
- Kevin Whinnery / DX / [@kevinwhinnery](https://x.com/kevinwhinnery)

```

## `package.json`

```json
{
  "name": "openai-realtime-console",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "dependencies": {
    "@openai/realtime-api-beta": "github:openai/openai-realtime-api-beta",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/node": "^16.18.108",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "dotenv": "^16.4.5",
    "leaflet": "^1.9.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-feather": "^2.0.10",
    "react-leaflet": "^4.2.1",
    "react-scripts": "^5.0.1",
    "sass": "^1.78.0",
    "save": "^2.9.0",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4",
    "ws": "^8.18.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "zip": "zip -r realtime-api-console.zip . -x 'node_modules' 'node_modules/*' 'node_modules/**' '.git' '.git/*' '.git/**' '.DS_Store' '*/.DS_Store' 'package-lock.json' '*.zip' '*.tar.gz' '*.tar' '.env'",
    "relay": "nodemon ./relay-server/index.js"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
    "@types/leaflet": "^1.9.13",
    "@types/react-leaflet": "^2.8.3",
    "nodemon": "^3.1.7"
  }
}

```

## `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/openai-logomark.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>realtime console</title>
    <!-- Fonts -->
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"
      rel="stylesheet"
    />
    <!-- Leaflet / OpenStreetMap -->
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
      integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
      crossorigin=""
    />
    <script
      src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
      integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
      crossorigin=""
    ></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>

```

## `public/openai-logomark.svg`

```svg
<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"><path d="m297.06 130.97c7.26-21.79 4.76-45.66-6.85-65.48-17.46-30.4-52.56-46.04-86.84-38.68-15.25-17.18-37.16-26.95-60.13-26.81-35.04-.08-66.13 22.48-76.91 55.82-22.51 4.61-41.94 18.7-53.31 38.67-17.59 30.32-13.58 68.54 9.92 94.54-7.26 21.79-4.76 45.66 6.85 65.48 17.46 30.4 52.56 46.04 86.84 38.68 15.24 17.18 37.16 26.95 60.13 26.8 35.06.09 66.16-22.49 76.94-55.86 22.51-4.61 41.94-18.7 53.31-38.67 17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11c-14.03.02-27.62-4.89-38.39-13.88.49-.26 1.34-.73 1.89-1.07l63.72-36.8c3.26-1.85 5.26-5.32 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03c-7.03-12.14-9.56-26.37-7.15-40.18.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94-7.01 12.14-18.05 21.44-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8c-3.23-1.89-7.23-1.89-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22 6.99 12.12 9.52 26.31 7.15 40.1zm-168.51 55.43-26.94-15.55c-.29-.14-.48-.42-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8c-3.26 1.85-5.26 5.31-5.24 9.06l-.04 89.79zm14.63-31.54 34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z"/></svg>
```

## `public/robots.txt`

```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

```

## `readme/realtime-console-demo.png`

无法读取文件内容: 'utf-8' codec can't decode byte 0x89 in position 0: invalid start byte

## `relay-server/index.js`

```js
import { RealtimeRelay } from './lib/relay.js';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error(
    `Environment variable "OPENAI_API_KEY" is required.\n` +
      `Please set it in your .env file.`
  );
  process.exit(1);
}

const PORT = parseInt(process.env.PORT) || 8081;

const relay = new RealtimeRelay(OPENAI_API_KEY);
relay.listen(PORT);

```

## `relay-server/lib/relay.js`

```js
import { WebSocketServer } from 'ws';
import { RealtimeClient } from '@openai/realtime-api-beta';

export class RealtimeRelay {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.sockets = new WeakMap();
    this.wss = null;
  }

  listen(port) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', this.connectionHandler.bind(this));
    this.log(`Listening on ws://localhost:${port}`);
  }

  async connectionHandler(ws, req) {
    if (!req.url) {
      this.log('No URL provided, closing connection.');
      ws.close();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname !== '/') {
      this.log(`Invalid pathname: "${pathname}"`);
      ws.close();
      return;
    }

    // Instantiate new client
    this.log(`Connecting with key "${this.apiKey.slice(0, 3)}..."`);
    const client = new RealtimeClient({ apiKey: this.apiKey });

    // Relay: OpenAI Realtime API Event -> Browser Event
    client.realtime.on('server.*', (event) => {
      this.log(`Relaying "${event.type}" to Client`);
      ws.send(JSON.stringify(event));
    });
    client.realtime.on('close', () => ws.close());

    // Relay: Browser Event -> OpenAI Realtime API Event
    // We need to queue data waiting for the OpenAI connection
    const messageQueue = [];
    const messageHandler = (data) => {
      try {
        const event = JSON.parse(data);
        this.log(`Relaying "${event.type}" to OpenAI`);
        client.realtime.send(event.type, event);
      } catch (e) {
        console.error(e.message);
        this.log(`Error parsing event from client: ${data}`);
      }
    };
    ws.on('message', (data) => {
      if (!client.isConnected()) {
        messageQueue.push(data);
      } else {
        messageHandler(data);
      }
    });
    ws.on('close', () => client.disconnect());

    // Connect to OpenAI Realtime API
    try {
      this.log(`Connecting to OpenAI...`);
      await client.connect();
    } catch (e) {
      this.log(`Error connecting to OpenAI: ${e.message}`);
      ws.close();
      return;
    }
    this.log(`Connected to OpenAI successfully!`);
    while (messageQueue.length) {
      messageHandler(messageQueue.shift());
    }
  }

  log(...args) {
    console.log(`[RealtimeRelay]`, ...args);
  }
}

```

## `src/App.scss`

```scss
[data-component='App'] {
  height: 100%;
  width: 100%;
  position: relative;
}

```

## `src/App.tsx`

```tsx
import { ConsolePage } from './pages/ConsolePage';
import './App.scss';

function App() {
  return (
    <div data-component="App">
      <ConsolePage />
    </div>
  );
}

export default App;

```

## `src/components/Map.scss`

```scss
[data-component='Map'] {
  position: absolute;
  width: 100%;
  height: 100%;
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
}

```

## `src/components/Map.tsx`

```tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import './Map.scss';

function ChangeView({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export function Map({
  center,
  location = 'My Location',
}: {
  center: LatLngTuple;
  location?: string;
}) {
  return (
    <div data-component="Map">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <ChangeView center={center} zoom={11} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center}>
          <Popup>{location}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

```

## `src/components/button/Button.scss`

```scss
[data-component='Button'] {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  border: none;
  background-color: #ececf1;
  color: #101010;
  border-radius: 1000px;
  padding: 8px 24px;
  min-height: 42px;
  transition: transform 0.1s ease-in-out, background-color 0.1s ease-in-out;
  outline: none;

  &.button-style-action {
    background-color: #101010;
    color: #ececf1;
    &:hover:not([disabled]) {
      background-color: #404040;
    }
  }

  &.button-style-alert {
    background-color: #f00;
    color: #ececf1;
    &:hover:not([disabled]) {
      background-color: #f00;
    }
  }

  &.button-style-flush {
    background-color: rgba(255, 255, 255, 0);
  }

  &[disabled] {
    color: #999;
  }

  &:not([disabled]) {
    cursor: pointer;
  }

  &:hover:not([disabled]) {
    background-color: #d8d8d8;
  }

  &:active:not([disabled]) {
    transform: translateY(1px);
  }

  .icon {
    display: flex;
    &.icon-start {
      margin-left: -8px;
    }
    &.icon-end {
      margin-right: -8px;
    }
    svg {
      width: 16px;
      height: 16px;
    }
  }

  &.icon-red .icon {
    color: #cc0000;
  }
  &.icon-green .icon {
    color: #009900;
  }
  &.icon-grey .icon {
    color: #909090;
  }
  &.icon-fill {
    svg {
      fill: currentColor;
    }
  }
}

```

## `src/components/button/Button.tsx`

```tsx
import React from 'react';
import './Button.scss';

import { Icon } from 'react-feather';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: Icon;
  iconPosition?: 'start' | 'end';
  iconColor?: 'red' | 'green' | 'grey';
  iconFill?: boolean;
  buttonStyle?: 'regular' | 'action' | 'alert' | 'flush';
}

export function Button({
  label = 'Okay',
  icon = void 0,
  iconPosition = 'start',
  iconColor = void 0,
  iconFill = false,
  buttonStyle = 'regular',
  ...rest
}: ButtonProps) {
  const StartIcon = iconPosition === 'start' ? icon : null;
  const EndIcon = iconPosition === 'end' ? icon : null;
  const classList = [];
  if (iconColor) {
    classList.push(`icon-${iconColor}`);
  }
  if (iconFill) {
    classList.push(`icon-fill`);
  }
  classList.push(`button-style-${buttonStyle}`);

  return (
    <button data-component="Button" className={classList.join(' ')} {...rest}>
      {StartIcon && (
        <span className="icon icon-start">
          <StartIcon />
        </span>
      )}
      <span className="label">{label}</span>
      {EndIcon && (
        <span className="icon icon-end">
          <EndIcon />
        </span>
      )}
    </button>
  );
}

```

## `src/components/toggle/Toggle.scss`

```scss
[data-component='Toggle'] {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  overflow: hidden;

  background-color: #ececf1;
  color: #101010;
  height: 40px;
  border-radius: 1000px;

  &:hover {
    background-color: #d8d8d8;
  }

  div.label {
    position: relative;
    color: #666;
    transition: color 0.1s ease-in-out;
    padding: 0px 16px;
    z-index: 2;
    user-select: none;
  }

  div.label.right {
    margin-left: -8px;
  }

  .toggle-background {
    background-color: #101010;
    position: absolute;
    top: 0px;
    left: 0px;
    width: auto;
    bottom: 0px;
    z-index: 1;
    border-radius: 1000px;
    transition: left 0.1s ease-in-out, width 0.1s ease-in-out;
  }

  &[data-enabled='true'] {
    div.label.right {
      color: #fff;
    }
  }

  &[data-enabled='false'] {
    div.label.left {
      color: #fff;
    }
  }
}

```

## `src/components/toggle/Toggle.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';

import './Toggle.scss';

export function Toggle({
  defaultValue = false,
  values,
  labels,
  onChange = () => {},
}: {
  defaultValue?: string | boolean;
  values?: string[];
  labels?: string[];
  onChange?: (isEnabled: boolean, value: string) => void;
}) {
  if (typeof defaultValue === 'string') {
    defaultValue = !!Math.max(0, (values || []).indexOf(defaultValue));
  }

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<boolean>(defaultValue);

  const toggleValue = () => {
    const v = !value;
    const index = +v;
    setValue(v);
    onChange(v, (values || [])[index]);
  };

  useEffect(() => {
    const leftEl = leftRef.current;
    const rightEl = rightRef.current;
    const bgEl = bgRef.current;
    if (leftEl && rightEl && bgEl) {
      if (value) {
        bgEl.style.left = rightEl.offsetLeft + 'px';
        bgEl.style.width = rightEl.offsetWidth + 'px';
      } else {
        bgEl.style.left = '';
        bgEl.style.width = leftEl.offsetWidth + 'px';
      }
    }
  }, [value]);

  return (
    <div
      data-component="Toggle"
      onClick={toggleValue}
      data-enabled={value.toString()}
    >
      {labels && (
        <div className="label left" ref={leftRef}>
          {labels[0]}
        </div>
      )}
      {labels && (
        <div className="label right" ref={rightRef}>
          {labels[1]}
        </div>
      )}
      <div className="toggle-background" ref={bgRef}></div>
    </div>
  );
}

```

## `src/index.css`

```css
html,
body {
  padding: 0px;
  margin: 0px;
  position: relative;
  width: 100%;
  height: 100%;
  font-family: 'Assistant', sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  color: #18181b;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

```

## `src/index.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

```

## `src/lib/wavtools/dist/index.d.ts`

```ts
import { AudioAnalysis } from './lib/analysis/audio_analysis.js';
import { WavPacker } from './lib/wav_packer.js';
import { WavStreamPlayer } from './lib/wav_stream_player.js';
import { WavRecorder } from './lib/wav_recorder.js';
export { AudioAnalysis, WavPacker, WavStreamPlayer, WavRecorder };
//# sourceMappingURL=index.d.ts.map
```

## `src/lib/wavtools/dist/index.d.ts.map`

```map
{"version":3,"file":"index.d.ts","sourceRoot":"","sources":["../index.js"],"names":[],"mappings":"8BAC8B,kCAAkC;0BADtC,qBAAqB;gCAEf,4BAA4B;4BAChC,uBAAuB"}
```

## `src/lib/wavtools/dist/lib/analysis/audio_analysis.d.ts`

```ts
/**
 * Output of AudioAnalysis for the frequency domain of the audio
 * @typedef {Object} AudioAnalysisOutputType
 * @property {Float32Array} values Amplitude of this frequency between {0, 1} inclusive
 * @property {number[]} frequencies Raw frequency bucket values
 * @property {string[]} labels Labels for the frequency bucket values
 */
/**
 * Analyzes audio for visual output
 * @class
 */
export class AudioAnalysis {
    /**
     * Retrieves frequency domain data from an AnalyserNode adjusted to a decibel range
     * returns human-readable formatting and labels
     * @param {AnalyserNode} analyser
     * @param {number} sampleRate
     * @param {Float32Array} [fftResult]
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {AudioAnalysisOutputType}
     */
    static getFrequencies(analyser: AnalyserNode, sampleRate: number, fftResult?: Float32Array, analysisType?: "frequency" | "music" | "voice", minDecibels?: number, maxDecibels?: number): AudioAnalysisOutputType;
    /**
     * Creates a new AudioAnalysis instance for an HTMLAudioElement
     * @param {HTMLAudioElement} audioElement
     * @param {AudioBuffer|null} [audioBuffer] If provided, will cache all frequency domain data from the buffer
     * @returns {AudioAnalysis}
     */
    constructor(audioElement: HTMLAudioElement, audioBuffer?: AudioBuffer | null);
    fftResults: any[];
    audio: HTMLAudioElement;
    context: any;
    analyser: any;
    sampleRate: any;
    audioBuffer: any;
    /**
     * Gets the current frequency domain data from the playing audio track
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {AudioAnalysisOutputType}
     */
    getFrequencies(analysisType?: "frequency" | "music" | "voice", minDecibels?: number, maxDecibels?: number): AudioAnalysisOutputType;
    /**
     * Resume the internal AudioContext if it was suspended due to the lack of
     * user interaction when the AudioAnalysis was instantiated.
     * @returns {Promise<true>}
     */
    resumeIfSuspended(): Promise<true>;
}
/**
 * Output of AudioAnalysis for the frequency domain of the audio
 */
export type AudioAnalysisOutputType = {
    /**
     * Amplitude of this frequency between {0, 1} inclusive
     */
    values: Float32Array;
    /**
     * Raw frequency bucket values
     */
    frequencies: number[];
    /**
     * Labels for the frequency bucket values
     */
    labels: string[];
};
//# sourceMappingURL=audio_analysis.d.ts.map
```

## `src/lib/wavtools/dist/lib/analysis/audio_analysis.d.ts.map`

```map
{"version":3,"file":"audio_analysis.d.ts","sourceRoot":"","sources":["../../../lib/analysis/audio_analysis.js"],"names":[],"mappings":"AAOA;;;;;;GAMG;AAEH;;;GAGG;AACH;IACE;;;;;;;;;;OAUG;IACH,gCARW,YAAY,cACZ,MAAM,cACN,YAAY,iBACZ,WAAW,GAAC,OAAO,GAAC,OAAO,gBAC3B,MAAM,gBACN,MAAM,GACJ,uBAAuB,CAwDnC;IAED;;;;;OAKG;IACH,0BAJW,gBAAgB,gBAChB,WAAW,GAAC,IAAI,EAkE1B;IA9DC,kBAAoB;IA2ClB,wBAAyB;IACzB,aAAkC;IAClC,cAAwB;IACxB,gBAA4B;IAC5B,iBAA8B;IAiBlC;;;;;;OAMG;IACH,8BALW,WAAW,GAAC,OAAO,GAAC,OAAO,gBAC3B,MAAM,gBACN,MAAM,GACJ,uBAAuB,CAwBnC;IAED;;;;OAIG;IACH,qBAFa,OAAO,CAAC,IAAI,CAAC,CAOzB;CACF;;;;;;;;YA9La,YAAY;;;;iBACZ,MAAM,EAAE;;;;YACR,MAAM,EAAE"}
```

## `src/lib/wavtools/dist/lib/analysis/constants.d.ts`

```ts
/**
 * All note frequencies from 1st to 8th octave
 * in format "A#8" (A#, 8th octave)
 */
export const noteFrequencies: any[];
export const noteFrequencyLabels: any[];
export const voiceFrequencies: any[];
export const voiceFrequencyLabels: any[];
//# sourceMappingURL=constants.d.ts.map
```

## `src/lib/wavtools/dist/lib/analysis/constants.d.ts.map`

```map
{"version":3,"file":"constants.d.ts","sourceRoot":"","sources":["../../../lib/analysis/constants.js"],"names":[],"mappings":"AA6BA;;;GAGG;AACH,oCAAkC;AAClC,wCAAsC;AActC,qCAKG;AACH,yCAKG"}
```

## `src/lib/wavtools/dist/lib/wav_packer.d.ts`

```ts
/**
 * Raw wav audio file contents
 * @typedef {Object} WavPackerAudioType
 * @property {Blob} blob
 * @property {string} url
 * @property {number} channelCount
 * @property {number} sampleRate
 * @property {number} duration
 */
/**
 * Utility class for assembling PCM16 "audio/wav" data
 * @class
 */
export class WavPacker {
    /**
     * Converts Float32Array of amplitude data to ArrayBuffer in Int16Array format
     * @param {Float32Array} float32Array
     * @returns {ArrayBuffer}
     */
    static floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer;
    /**
     * Concatenates two ArrayBuffers
     * @param {ArrayBuffer} leftBuffer
     * @param {ArrayBuffer} rightBuffer
     * @returns {ArrayBuffer}
     */
    static mergeBuffers(leftBuffer: ArrayBuffer, rightBuffer: ArrayBuffer): ArrayBuffer;
    /**
     * Packs data into an Int16 format
     * @private
     * @param {number} size 0 = 1x Int16, 1 = 2x Int16
     * @param {number} arg value to pack
     * @returns
     */
    private _packData;
    /**
     * Packs audio into "audio/wav" Blob
     * @param {number} sampleRate
     * @param {{bitsPerSample: number, channels: Array<Float32Array>, data: Int16Array}} audio
     * @returns {WavPackerAudioType}
     */
    pack(sampleRate: number, audio: {
        bitsPerSample: number;
        channels: Array<Float32Array>;
        data: Int16Array;
    }): WavPackerAudioType;
}
/**
 * Raw wav audio file contents
 */
export type WavPackerAudioType = {
    blob: Blob;
    url: string;
    channelCount: number;
    sampleRate: number;
    duration: number;
};
//# sourceMappingURL=wav_packer.d.ts.map
```

## `src/lib/wavtools/dist/lib/wav_packer.d.ts.map`

```map
{"version":3,"file":"wav_packer.d.ts","sourceRoot":"","sources":["../../lib/wav_packer.js"],"names":[],"mappings":"AAAA;;;;;;;;GAQG;AAEH;;;GAGG;AACH;IACE;;;;OAIG;IACH,qCAHW,YAAY,GACV,WAAW,CAWvB;IAED;;;;;OAKG;IACH,gCAJW,WAAW,eACX,WAAW,GACT,WAAW,CASvB;IAED;;;;;;OAMG;IACH,kBAKC;IAED;;;;;OAKG;IACH,iBAJW,MAAM,SACN;QAAC,aAAa,EAAE,MAAM,CAAC;QAAC,QAAQ,EAAE,KAAK,CAAC,YAAY,CAAC,CAAC;QAAC,IAAI,EAAE,UAAU,CAAA;KAAC,GACtE,kBAAkB,CA6C9B;CACF;;;;;UA3Ga,IAAI;SACJ,MAAM;kBACN,MAAM;gBACN,MAAM;cACN,MAAM"}
```

## `src/lib/wavtools/dist/lib/wav_recorder.d.ts`

```ts
/**
 * Decodes audio into a wav file
 * @typedef {Object} DecodedAudioType
 * @property {Blob} blob
 * @property {string} url
 * @property {Float32Array} values
 * @property {AudioBuffer} audioBuffer
 */
/**
 * Records live stream of user audio as PCM16 "audio/wav" data
 * @class
 */
export class WavRecorder {
    /**
     * Decodes audio data from multiple formats to a Blob, url, Float32Array and AudioBuffer
     * @param {Blob|Float32Array|Int16Array|ArrayBuffer|number[]} audioData
     * @param {number} sampleRate
     * @param {number} fromSampleRate
     * @returns {Promise<DecodedAudioType>}
     */
    static decode(audioData: Blob | Float32Array | Int16Array | ArrayBuffer | number[], sampleRate?: number, fromSampleRate?: number): Promise<DecodedAudioType>;
    /**
     * Create a new WavRecorder instance
     * @param {{sampleRate?: number, outputToSpeakers?: boolean, debug?: boolean}} [options]
     * @returns {WavRecorder}
     */
    constructor({ sampleRate, outputToSpeakers, debug, }?: {
        sampleRate?: number;
        outputToSpeakers?: boolean;
        debug?: boolean;
    });
    scriptSrc: any;
    sampleRate: number;
    outputToSpeakers: boolean;
    debug: boolean;
    _deviceChangeCallback: () => Promise<void>;
    _devices: any[];
    stream: any;
    processor: any;
    source: any;
    node: any;
    recording: boolean;
    _lastEventId: number;
    eventReceipts: {};
    eventTimeout: number;
    _chunkProcessor: () => void;
    _chunkProcessorBuffer: {
        raw: ArrayBuffer;
        mono: ArrayBuffer;
    };
    /**
     * Logs data in debug mode
     * @param {...any} arguments
     * @returns {true}
     */
    log(...args: any[]): true;
    /**
     * Retrieves the current sampleRate for the recorder
     * @returns {number}
     */
    getSampleRate(): number;
    /**
     * Retrieves the current status of the recording
     * @returns {"ended"|"paused"|"recording"}
     */
    getStatus(): "ended" | "paused" | "recording";
    /**
     * Sends an event to the AudioWorklet
     * @private
     * @param {string} name
     * @param {{[key: string]: any}} data
     * @param {AudioWorkletNode} [_processor]
     * @returns {Promise<{[key: string]: any}>}
     */
    private _event;
    /**
     * Sets device change callback, remove if callback provided is `null`
     * @param {(Array<MediaDeviceInfo & {default: boolean}>): void|null} callback
     * @returns {true}
     */
    listenForDeviceChange(callback: any): true;
    /**
     * Manually request permission to use the microphone
     * @returns {Promise<true>}
     */
    requestPermission(): Promise<true>;
    /**
     * List all eligible devices for recording, will request permission to use microphone
     * @returns {Promise<Array<MediaDeviceInfo & {default: boolean}>>}
     */
    listDevices(): Promise<Array<MediaDeviceInfo & {
        default: boolean;
    }>>;
    /**
     * Begins a recording session and requests microphone permissions if not already granted
     * Microphone recording indicator will appear on browser tab but status will be "paused"
     * @param {string} [deviceId] if no device provided, default device will be used
     * @returns {Promise<true>}
     */
    begin(deviceId?: string): Promise<true>;
    analyser: any;
    /**
     * Gets the current frequency domain data from the recording track
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
     */
    getFrequencies(analysisType?: "frequency" | "music" | "voice", minDecibels?: number, maxDecibels?: number): import("./analysis/audio_analysis.js").AudioAnalysisOutputType;
    /**
     * Pauses the recording
     * Keeps microphone stream open but halts storage of audio
     * @returns {Promise<true>}
     */
    pause(): Promise<true>;
    /**
     * Start recording stream and storing to memory from the connected audio source
     * @param {(data: { mono: Int16Array; raw: Int16Array }) => any} [chunkProcessor]
     * @param {number} [chunkSize] chunkProcessor will not be triggered until this size threshold met in mono audio
     * @returns {Promise<true>}
     */
    record(chunkProcessor?: (data: {
        mono: Int16Array;
        raw: Int16Array;
    }) => any, chunkSize?: number): Promise<true>;
    _chunkProcessorSize: number;
    /**
     * Clears the audio buffer, empties stored recording
     * @returns {Promise<true>}
     */
    clear(): Promise<true>;
    /**
     * Reads the current audio stream data
     * @returns {Promise<{meanValues: Float32Array, channels: Array<Float32Array>}>}
     */
    read(): Promise<{
        meanValues: Float32Array;
        channels: Array<Float32Array>;
    }>;
    /**
     * Saves the current audio stream to a file
     * @param {boolean} [force] Force saving while still recording
     * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
     */
    save(force?: boolean): Promise<import("./wav_packer.js").WavPackerAudioType>;
    /**
     * Ends the current recording session and saves the result
     * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
     */
    end(): Promise<import("./wav_packer.js").WavPackerAudioType>;
    /**
     * Performs a full cleanup of WavRecorder instance
     * Stops actively listening via microphone and removes existing listeners
     * @returns {Promise<true>}
     */
    quit(): Promise<true>;
}
/**
 * Decodes audio into a wav file
 */
export type DecodedAudioType = {
    blob: Blob;
    url: string;
    values: Float32Array;
    audioBuffer: AudioBuffer;
};
//# sourceMappingURL=wav_recorder.d.ts.map
```

## `src/lib/wavtools/dist/lib/wav_recorder.d.ts.map`

```map
{"version":3,"file":"wav_recorder.d.ts","sourceRoot":"","sources":["../../lib/wav_recorder.js"],"names":[],"mappings":"AAIA;;;;;;;GAOG;AAEH;;;GAGG;AACH;IAsCE;;;;;;OAMG;IACH,yBALW,IAAI,GAAC,YAAY,GAAC,UAAU,GAAC,WAAW,GAAC,MAAM,EAAE,eACjD,MAAM,mBACN,MAAM,GACJ,OAAO,CAAC,gBAAgB,CAAC,CAqErC;IA/GD;;;;OAIG;IACH,uDAHW;QAAC,UAAU,CAAC,EAAE,MAAM,CAAC;QAAC,gBAAgB,CAAC,EAAE,OAAO,CAAC;QAAC,KAAK,CAAC,EAAE,OAAO,CAAA;KAAC,EAiC5E;IAxBC,eAAkC;IAElC,mBAA4B;IAC5B,0BAAwC;IACxC,eAAoB;IACpB,2CAAiC;IACjC,gBAAkB;IAElB,YAAkB;IAClB,eAAqB;IACrB,YAAkB;IAClB,UAAgB;IAChB,mBAAsB;IAEtB,qBAAqB;IACrB,kBAAuB;IACvB,qBAAwB;IAExB,4BAA+B;IAE/B;;;MAGC;IA+EH;;;;OAIG;IACH,qBAFa,IAAI,CAOhB;IAED;;;OAGG;IACH,iBAFa,MAAM,CAIlB;IAED;;;OAGG;IACH,aAFa,OAAO,GAAC,QAAQ,GAAC,WAAW,CAUxC;IAED;;;;;;;OAOG;IACH,eAqBC;IAED;;;;OAIG;IACH,sCAFa,IAAI,CAmChB;IAED;;;OAGG;IACH,qBAFa,OAAO,CAAC,IAAI,CAAC,CAoBzB;IAED;;;OAGG;IACH,eAFa,OAAO,CAAC,KAAK,CAAC,eAAe,GAAG;QAAC,OAAO,EAAE,OAAO,CAAA;KAAC,CAAC,CAAC,CA8BhE;IAED;;;;;OAKG;IACH,iBAHW,MAAM,GACJ,OAAO,CAAC,IAAI,CAAC,CAkFzB;IAHC,cAAwB;IAK1B;;;;;;OAMG;IACH,8BALW,WAAW,GAAC,OAAO,GAAC,OAAO,gBAC3B,MAAM,gBACN,MAAM,GACJ,OAAO,8BAA8B,EAAE,uBAAuB,CAkB1E;IAED;;;;OAIG;IACH,SAFa,OAAO,CAAC,IAAI,CAAC,CAezB;IAED;;;;;OAKG;IACH,wBAJW,CAAC,IAAI,EAAE;QAAE,IAAI,EAAE,UAAU,CAAC;QAAC,GAAG,EAAE,UAAU,CAAA;KAAE,KAAK,GAAG,cACpD,MAAM,GACJ,OAAO,CAAC,IAAI,CAAC,CAoBzB;IATC,4BAAoC;IAWtC;;;OAGG;IACH,SAFa,OAAO,CAAC,IAAI,CAAC,CAQzB;IAED;;;OAGG;IACH,QAFa,OAAO,CAAC;QAAC,UAAU,EAAE,YAAY,CAAC;QAAC,QAAQ,EAAE,KAAK,CAAC,YAAY,CAAC,CAAA;KAAC,CAAC,CAS9E;IAED;;;;OAIG;IACH,aAHW,OAAO,GACL,OAAO,CAAC,OAAO,iBAAiB,EAAE,kBAAkB,CAAC,CAgBjE;IAED;;;OAGG;IACH,OAFa,OAAO,CAAC,OAAO,iBAAiB,EAAE,kBAAkB,CAAC,CA8BjE;IAED;;;;OAIG;IACH,QAFa,OAAO,CAAC,IAAI,CAAC,CAQzB;CACF;;;;;UA1hBa,IAAI;SACJ,MAAM;YACN,YAAY;iBACZ,WAAW"}
```

## `src/lib/wavtools/dist/lib/wav_stream_player.d.ts`

```ts
/**
 * Plays audio streams received in raw PCM16 chunks from the browser
 * @class
 */
export class WavStreamPlayer {
    /**
     * Creates a new WavStreamPlayer instance
     * @param {{sampleRate?: number}} options
     * @returns {WavStreamPlayer}
     */
    constructor({ sampleRate }?: {
        sampleRate?: number;
    });
    scriptSrc: any;
    sampleRate: number;
    context: any;
    stream: any;
    analyser: any;
    trackSampleOffsets: {};
    interruptedTrackIds: {};
    /**
     * Connects the audio context and enables output to speakers
     * @returns {Promise<true>}
     */
    connect(): Promise<true>;
    /**
     * Gets the current frequency domain data from the playing track
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
     */
    getFrequencies(analysisType?: "frequency" | "music" | "voice", minDecibels?: number, maxDecibels?: number): import("./analysis/audio_analysis.js").AudioAnalysisOutputType;
    /**
     * Starts audio streaming
     * @private
     * @returns {Promise<true>}
     */
    private _start;
    /**
     * Adds 16BitPCM data to the currently playing audio stream
     * You can add chunks beyond the current play point and they will be queued for play
     * @param {ArrayBuffer|Int16Array} arrayBuffer
     * @param {string} [trackId]
     * @returns {Int16Array}
     */
    add16BitPCM(arrayBuffer: ArrayBuffer | Int16Array, trackId?: string): Int16Array;
    /**
     * Gets the offset (sample count) of the currently playing stream
     * @param {boolean} [interrupt]
     * @returns {{trackId: string|null, offset: number, currentTime: number}}
     */
    getTrackSampleOffset(interrupt?: boolean): {
        trackId: string | null;
        offset: number;
        currentTime: number;
    };
    /**
     * Strips the current stream and returns the sample offset of the audio
     * @param {boolean} [interrupt]
     * @returns {{trackId: string|null, offset: number, currentTime: number}}
     */
    interrupt(): {
        trackId: string | null;
        offset: number;
        currentTime: number;
    };
}
//# sourceMappingURL=wav_stream_player.d.ts.map
```

## `src/lib/wavtools/dist/lib/wav_stream_player.d.ts.map`

```map
{"version":3,"file":"wav_stream_player.d.ts","sourceRoot":"","sources":["../../lib/wav_stream_player.js"],"names":[],"mappings":"AAGA;;;GAGG;AACH;IACE;;;;OAIG;IACH,6BAHW;QAAC,UAAU,CAAC,EAAE,MAAM,CAAA;KAAC,EAW/B;IAPC,eAAmC;IACnC,mBAA4B;IAC5B,aAAmB;IACnB,YAAkB;IAClB,cAAoB;IACpB,uBAA4B;IAC5B,wBAA6B;IAG/B;;;OAGG;IACH,WAFa,OAAO,CAAC,IAAI,CAAC,CAkBzB;IAED;;;;;;OAMG;IACH,8BALW,WAAW,GAAC,OAAO,GAAC,OAAO,gBAC3B,MAAM,gBACN,MAAM,GACJ,OAAO,8BAA8B,EAAE,uBAAuB,CAkB1E;IAED;;;;OAIG;IACH,eAkBC;IAED;;;;;;OAMG;IACH,yBAJW,WAAW,GAAC,UAAU,YACtB,MAAM,GACJ,UAAU,CAqBtB;IAED;;;;OAIG;IACH,iCAHW,OAAO,GACL;QAAC,OAAO,EAAE,MAAM,GAAC,IAAI,CAAC;QAAC,MAAM,EAAE,MAAM,CAAC;QAAC,WAAW,EAAE,MAAM,CAAA;KAAC,CAqBvE;IAED;;;;OAIG;IACH,aAFa;QAAC,OAAO,EAAE,MAAM,GAAC,IAAI,CAAC;QAAC,MAAM,EAAE,MAAM,CAAC;QAAC,WAAW,EAAE,MAAM,CAAA;KAAC,CAIvE;CACF"}
```

## `src/lib/wavtools/dist/lib/worklets/audio_processor.d.ts`

```ts
export const AudioProcessorSrc: any;
//# sourceMappingURL=audio_processor.d.ts.map
```

## `src/lib/wavtools/dist/lib/worklets/audio_processor.d.ts.map`

```map
{"version":3,"file":"audio_processor.d.ts","sourceRoot":"","sources":["../../../lib/worklets/audio_processor.js"],"names":[],"mappings":"AAqNA,oCAAqC"}
```

## `src/lib/wavtools/dist/lib/worklets/stream_processor.d.ts`

```ts
export const StreamProcessorWorklet: "\nclass StreamProcessor extends AudioWorkletProcessor {\n  constructor() {\n    super();\n    this.hasStarted = false;\n    this.hasInterrupted = false;\n    this.outputBuffers = [];\n    this.bufferLength = 128;\n    this.write = { buffer: new Float32Array(this.bufferLength), trackId: null };\n    this.writeOffset = 0;\n    this.trackSampleOffsets = {};\n    this.port.onmessage = (event) => {\n      if (event.data) {\n        const payload = event.data;\n        if (payload.event === 'write') {\n          const int16Array = payload.buffer;\n          const float32Array = new Float32Array(int16Array.length);\n          for (let i = 0; i < int16Array.length; i++) {\n            float32Array[i] = int16Array[i] / 0x8000; // Convert Int16 to Float32\n          }\n          this.writeData(float32Array, payload.trackId);\n        } else if (\n          payload.event === 'offset' ||\n          payload.event === 'interrupt'\n        ) {\n          const requestId = payload.requestId;\n          const trackId = this.write.trackId;\n          const offset = this.trackSampleOffsets[trackId] || 0;\n          this.port.postMessage({\n            event: 'offset',\n            requestId,\n            trackId,\n            offset,\n          });\n          if (payload.event === 'interrupt') {\n            this.hasInterrupted = true;\n          }\n        } else {\n          throw new Error(`Unhandled event \"${payload.event}\"`);\n        }\n      }\n    };\n  }\n\n  writeData(float32Array, trackId = null) {\n    let { buffer } = this.write;\n    let offset = this.writeOffset;\n    for (let i = 0; i < float32Array.length; i++) {\n      buffer[offset++] = float32Array[i];\n      if (offset >= buffer.length) {\n        this.outputBuffers.push(this.write);\n        this.write = { buffer: new Float32Array(this.bufferLength), trackId };\n        buffer = this.write.buffer;\n        offset = 0;\n      }\n    }\n    this.writeOffset = offset;\n    return true;\n  }\n\n  process(inputs, outputs, parameters) {\n    const output = outputs[0];\n    const outputChannelData = output[0];\n    const outputBuffers = this.outputBuffers;\n    if (this.hasInterrupted) {\n      this.port.postMessage({ event: 'stop' });\n      return false;\n    } else if (outputBuffers.length) {\n      this.hasStarted = true;\n      const { buffer, trackId } = outputBuffers.shift();\n      for (let i = 0; i < outputChannelData.length; i++) {\n        outputChannelData[i] = buffer[i] || 0;\n      }\n      if (trackId) {\n        this.trackSampleOffsets[trackId] =\n          this.trackSampleOffsets[trackId] || 0;\n        this.trackSampleOffsets[trackId] += buffer.length;\n      }\n      return true;\n    } else if (this.hasStarted) {\n      this.port.postMessage({ event: 'stop' });\n      return false;\n    } else {\n      return true;\n    }\n  }\n}\n\nregisterProcessor('stream_processor', StreamProcessor);\n";
export const StreamProcessorSrc: any;
//# sourceMappingURL=stream_processor.d.ts.map
```

## `src/lib/wavtools/dist/lib/worklets/stream_processor.d.ts.map`

```map
{"version":3,"file":"stream_processor.d.ts","sourceRoot":"","sources":["../../../lib/worklets/stream_processor.js"],"names":[],"mappings":"AAAA,q4FAyFE;AAMF,qCAAsC"}
```

## `src/lib/wavtools/index.js`

```js
import { WavPacker } from './lib/wav_packer.js';
import { AudioAnalysis } from './lib/analysis/audio_analysis.js';
import { WavStreamPlayer } from './lib/wav_stream_player.js';
import { WavRecorder } from './lib/wav_recorder.js';

export { AudioAnalysis, WavPacker, WavStreamPlayer, WavRecorder };

```

## `src/lib/wavtools/lib/analysis/audio_analysis.js`

```js
import {
  noteFrequencies,
  noteFrequencyLabels,
  voiceFrequencies,
  voiceFrequencyLabels,
} from './constants.js';

/**
 * Output of AudioAnalysis for the frequency domain of the audio
 * @typedef {Object} AudioAnalysisOutputType
 * @property {Float32Array} values Amplitude of this frequency between {0, 1} inclusive
 * @property {number[]} frequencies Raw frequency bucket values
 * @property {string[]} labels Labels for the frequency bucket values
 */

/**
 * Analyzes audio for visual output
 * @class
 */
export class AudioAnalysis {
  /**
   * Retrieves frequency domain data from an AnalyserNode adjusted to a decibel range
   * returns human-readable formatting and labels
   * @param {AnalyserNode} analyser
   * @param {number} sampleRate
   * @param {Float32Array} [fftResult]
   * @param {"frequency"|"music"|"voice"} [analysisType]
   * @param {number} [minDecibels] default -100
   * @param {number} [maxDecibels] default -30
   * @returns {AudioAnalysisOutputType}
   */
  static getFrequencies(
    analyser,
    sampleRate,
    fftResult,
    analysisType = 'frequency',
    minDecibels = -100,
    maxDecibels = -30,
  ) {
    if (!fftResult) {
      fftResult = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(fftResult);
    }
    const nyquistFrequency = sampleRate / 2;
    const frequencyStep = (1 / fftResult.length) * nyquistFrequency;
    let outputValues;
    let frequencies;
    let labels;
    if (analysisType === 'music' || analysisType === 'voice') {
      const useFrequencies =
        analysisType === 'voice' ? voiceFrequencies : noteFrequencies;
      const aggregateOutput = Array(useFrequencies.length).fill(minDecibels);
      for (let i = 0; i < fftResult.length; i++) {
        const frequency = i * frequencyStep;
        const amplitude = fftResult[i];
        for (let n = useFrequencies.length - 1; n >= 0; n--) {
          if (frequency > useFrequencies[n]) {
            aggregateOutput[n] = Math.max(aggregateOutput[n], amplitude);
            break;
          }
        }
      }
      outputValues = aggregateOutput;
      frequencies =
        analysisType === 'voice' ? voiceFrequencies : noteFrequencies;
      labels =
        analysisType === 'voice' ? voiceFrequencyLabels : noteFrequencyLabels;
    } else {
      outputValues = Array.from(fftResult);
      frequencies = outputValues.map((_, i) => frequencyStep * i);
      labels = frequencies.map((f) => `${f.toFixed(2)} Hz`);
    }
    // We normalize to {0, 1}
    const normalizedOutput = outputValues.map((v) => {
      return Math.max(
        0,
        Math.min((v - minDecibels) / (maxDecibels - minDecibels), 1),
      );
    });
    const values = new Float32Array(normalizedOutput);
    return {
      values,
      frequencies,
      labels,
    };
  }

  /**
   * Creates a new AudioAnalysis instance for an HTMLAudioElement
   * @param {HTMLAudioElement} audioElement
   * @param {AudioBuffer|null} [audioBuffer] If provided, will cache all frequency domain data from the buffer
   * @returns {AudioAnalysis}
   */
  constructor(audioElement, audioBuffer = null) {
    this.fftResults = [];
    if (audioBuffer) {
      /**
       * Modified from
       * https://stackoverflow.com/questions/75063715/using-the-web-audio-api-to-analyze-a-song-without-playing
       *
       * We do this to populate FFT values for the audio if provided an `audioBuffer`
       * The reason to do this is that Safari fails when using `createMediaElementSource`
       * This has a non-zero RAM cost so we only opt-in to run it on Safari, Chrome is better
       */
      const { length, sampleRate } = audioBuffer;
      const offlineAudioContext = new OfflineAudioContext({
        length,
        sampleRate,
      });
      const source = offlineAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      const analyser = offlineAudioContext.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.1;
      source.connect(analyser);
      // limit is :: 128 / sampleRate;
      // but we just want 60fps - cuts ~1s from 6MB to 1MB of RAM
      const renderQuantumInSeconds = 1 / 60;
      const durationInSeconds = length / sampleRate;
      const analyze = (index) => {
        const suspendTime = renderQuantumInSeconds * index;
        if (suspendTime < durationInSeconds) {
          offlineAudioContext.suspend(suspendTime).then(() => {
            const fftResult = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(fftResult);
            this.fftResults.push(fftResult);
            analyze(index + 1);
          });
        }
        if (index === 1) {
          offlineAudioContext.startRendering();
        } else {
          offlineAudioContext.resume();
        }
      };
      source.start(0);
      analyze(1);
      this.audio = audioElement;
      this.context = offlineAudioContext;
      this.analyser = analyser;
      this.sampleRate = sampleRate;
      this.audioBuffer = audioBuffer;
    } else {
      const audioContext = new AudioContext();
      const track = audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.1;
      track.connect(analyser);
      analyser.connect(audioContext.destination);
      this.audio = audioElement;
      this.context = audioContext;
      this.analyser = analyser;
      this.sampleRate = this.context.sampleRate;
      this.audioBuffer = null;
    }
  }

  /**
   * Gets the current frequency domain data from the playing audio track
   * @param {"frequency"|"music"|"voice"} [analysisType]
   * @param {number} [minDecibels] default -100
   * @param {number} [maxDecibels] default -30
   * @returns {AudioAnalysisOutputType}
   */
  getFrequencies(
    analysisType = 'frequency',
    minDecibels = -100,
    maxDecibels = -30,
  ) {
    let fftResult = null;
    if (this.audioBuffer && this.fftResults.length) {
      const pct = this.audio.currentTime / this.audio.duration;
      const index = Math.min(
        (pct * this.fftResults.length) | 0,
        this.fftResults.length - 1,
      );
      fftResult = this.fftResults[index];
    }
    return AudioAnalysis.getFrequencies(
      this.analyser,
      this.sampleRate,
      fftResult,
      analysisType,
      minDecibels,
      maxDecibels,
    );
  }

  /**
   * Resume the internal AudioContext if it was suspended due to the lack of
   * user interaction when the AudioAnalysis was instantiated.
   * @returns {Promise<true>}
   */
  async resumeIfSuspended() {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    return true;
  }
}

globalThis.AudioAnalysis = AudioAnalysis;

```

## `src/lib/wavtools/lib/analysis/constants.js`

```js
/**
 * Constants for help with visualization
 * Helps map frequency ranges from Fast Fourier Transform
 * to human-interpretable ranges, notably music ranges and
 * human vocal ranges.
 */

// Eighth octave frequencies
const octave8Frequencies = [
  4186.01, 4434.92, 4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93,
  6644.88, 7040.0, 7458.62, 7902.13,
];

// Labels for each of the above frequencies
const octave8FrequencyLabels = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

/**
 * All note frequencies from 1st to 8th octave
 * in format "A#8" (A#, 8th octave)
 */
export const noteFrequencies = [];
export const noteFrequencyLabels = [];
for (let i = 1; i <= 8; i++) {
  for (let f = 0; f < octave8Frequencies.length; f++) {
    const freq = octave8Frequencies[f];
    noteFrequencies.push(freq / Math.pow(2, 8 - i));
    noteFrequencyLabels.push(octave8FrequencyLabels[f] + i);
  }
}

/**
 * Subset of the note frequencies between 32 and 2000 Hz
 * 6 octave range: C1 to B6
 */
const voiceFrequencyRange = [32.0, 2000.0];
export const voiceFrequencies = noteFrequencies.filter((_, i) => {
  return (
    noteFrequencies[i] > voiceFrequencyRange[0] &&
    noteFrequencies[i] < voiceFrequencyRange[1]
  );
});
export const voiceFrequencyLabels = noteFrequencyLabels.filter((_, i) => {
  return (
    noteFrequencies[i] > voiceFrequencyRange[0] &&
    noteFrequencies[i] < voiceFrequencyRange[1]
  );
});

```

## `src/lib/wavtools/lib/wav_packer.js`

```js
/**
 * Raw wav audio file contents
 * @typedef {Object} WavPackerAudioType
 * @property {Blob} blob
 * @property {string} url
 * @property {number} channelCount
 * @property {number} sampleRate
 * @property {number} duration
 */

/**
 * Utility class for assembling PCM16 "audio/wav" data
 * @class
 */
export class WavPacker {
  /**
   * Converts Float32Array of amplitude data to ArrayBuffer in Int16Array format
   * @param {Float32Array} float32Array
   * @returns {ArrayBuffer}
   */
  static floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  /**
   * Concatenates two ArrayBuffers
   * @param {ArrayBuffer} leftBuffer
   * @param {ArrayBuffer} rightBuffer
   * @returns {ArrayBuffer}
   */
  static mergeBuffers(leftBuffer, rightBuffer) {
    const tmpArray = new Uint8Array(
      leftBuffer.byteLength + rightBuffer.byteLength
    );
    tmpArray.set(new Uint8Array(leftBuffer), 0);
    tmpArray.set(new Uint8Array(rightBuffer), leftBuffer.byteLength);
    return tmpArray.buffer;
  }

  /**
   * Packs data into an Int16 format
   * @private
   * @param {number} size 0 = 1x Int16, 1 = 2x Int16
   * @param {number} arg value to pack
   * @returns
   */
  _packData(size, arg) {
    return [
      new Uint8Array([arg, arg >> 8]),
      new Uint8Array([arg, arg >> 8, arg >> 16, arg >> 24]),
    ][size];
  }

  /**
   * Packs audio into "audio/wav" Blob
   * @param {number} sampleRate
   * @param {{bitsPerSample: number, channels: Array<Float32Array>, data: Int16Array}} audio
   * @returns {WavPackerAudioType}
   */
  pack(sampleRate, audio) {
    if (!audio?.bitsPerSample) {
      throw new Error(`Missing "bitsPerSample"`);
    } else if (!audio?.channels) {
      throw new Error(`Missing "channels"`);
    } else if (!audio?.data) {
      throw new Error(`Missing "data"`);
    }
    const { bitsPerSample, channels, data } = audio;
    const output = [
      // Header
      'RIFF',
      this._packData(
        1,
        4 + (8 + 24) /* chunk 1 length */ + (8 + 8) /* chunk 2 length */
      ), // Length
      'WAVE',
      // chunk 1
      'fmt ', // Sub-chunk identifier
      this._packData(1, 16), // Chunk length
      this._packData(0, 1), // Audio format (1 is linear quantization)
      this._packData(0, channels.length),
      this._packData(1, sampleRate),
      this._packData(1, (sampleRate * channels.length * bitsPerSample) / 8), // Byte rate
      this._packData(0, (channels.length * bitsPerSample) / 8),
      this._packData(0, bitsPerSample),
      // chunk 2
      'data', // Sub-chunk identifier
      this._packData(
        1,
        (channels[0].length * channels.length * bitsPerSample) / 8
      ), // Chunk length
      data,
    ];
    const blob = new Blob(output, { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    return {
      blob,
      url,
      channelCount: channels.length,
      sampleRate,
      duration: data.byteLength / (channels.length * sampleRate * 2),
    };
  }
}

globalThis.WavPacker = WavPacker;

```

## `src/lib/wavtools/lib/wav_recorder.js`

```js
import { AudioProcessorSrc } from './worklets/audio_processor.js';
import { AudioAnalysis } from './analysis/audio_analysis.js';
import { WavPacker } from './wav_packer.js';

/**
 * Decodes audio into a wav file
 * @typedef {Object} DecodedAudioType
 * @property {Blob} blob
 * @property {string} url
 * @property {Float32Array} values
 * @property {AudioBuffer} audioBuffer
 */

/**
 * Records live stream of user audio as PCM16 "audio/wav" data
 * @class
 */
export class WavRecorder {
  /**
   * Create a new WavRecorder instance
   * @param {{sampleRate?: number, outputToSpeakers?: boolean, debug?: boolean}} [options]
   * @returns {WavRecorder}
   */
  constructor({
    sampleRate = 44100,
    outputToSpeakers = false,
    debug = false,
  } = {}) {
    // Script source
    this.scriptSrc = AudioProcessorSrc;
    // Config
    this.sampleRate = sampleRate;
    this.outputToSpeakers = outputToSpeakers;
    this.debug = !!debug;
    this._deviceChangeCallback = null;
    this._devices = [];
    // State variables
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.node = null;
    this.recording = false;
    // Event handling with AudioWorklet
    this._lastEventId = 0;
    this.eventReceipts = {};
    this.eventTimeout = 5000;
    // Process chunks of audio
    this._chunkProcessor = () => {};
    this._chunkProcessorSize = void 0;
    this._chunkProcessorBuffer = {
      raw: new ArrayBuffer(0),
      mono: new ArrayBuffer(0),
    };
  }

  /**
   * Decodes audio data from multiple formats to a Blob, url, Float32Array and AudioBuffer
   * @param {Blob|Float32Array|Int16Array|ArrayBuffer|number[]} audioData
   * @param {number} sampleRate
   * @param {number} fromSampleRate
   * @returns {Promise<DecodedAudioType>}
   */
  static async decode(audioData, sampleRate = 44100, fromSampleRate = -1) {
    const context = new AudioContext({ sampleRate });
    let arrayBuffer;
    let blob;
    if (audioData instanceof Blob) {
      if (fromSampleRate !== -1) {
        throw new Error(
          `Can not specify "fromSampleRate" when reading from Blob`,
        );
      }
      blob = audioData;
      arrayBuffer = await blob.arrayBuffer();
    } else if (audioData instanceof ArrayBuffer) {
      if (fromSampleRate !== -1) {
        throw new Error(
          `Can not specify "fromSampleRate" when reading from ArrayBuffer`,
        );
      }
      arrayBuffer = audioData;
      blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    } else {
      let float32Array;
      let data;
      if (audioData instanceof Int16Array) {
        data = audioData;
        float32Array = new Float32Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          float32Array[i] = audioData[i] / 0x8000;
        }
      } else if (audioData instanceof Float32Array) {
        float32Array = audioData;
      } else if (audioData instanceof Array) {
        float32Array = new Float32Array(audioData);
      } else {
        throw new Error(
          `"audioData" must be one of: Blob, Float32Arrray, Int16Array, ArrayBuffer, Array<number>`,
        );
      }
      if (fromSampleRate === -1) {
        throw new Error(
          `Must specify "fromSampleRate" when reading from Float32Array, In16Array or Array`,
        );
      } else if (fromSampleRate < 3000) {
        throw new Error(`Minimum "fromSampleRate" is 3000 (3kHz)`);
      }
      if (!data) {
        data = WavPacker.floatTo16BitPCM(float32Array);
      }
      const audio = {
        bitsPerSample: 16,
        channels: [float32Array],
        data,
      };
      const packer = new WavPacker();
      const result = packer.pack(fromSampleRate, audio);
      blob = result.blob;
      arrayBuffer = await blob.arrayBuffer();
    }
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    const values = audioBuffer.getChannelData(0);
    const url = URL.createObjectURL(blob);
    return {
      blob,
      url,
      values,
      audioBuffer,
    };
  }

  /**
   * Logs data in debug mode
   * @param {...any} arguments
   * @returns {true}
   */
  log() {
    if (this.debug) {
      this.log(...arguments);
    }
    return true;
  }

  /**
   * Retrieves the current sampleRate for the recorder
   * @returns {number}
   */
  getSampleRate() {
    return this.sampleRate;
  }

  /**
   * Retrieves the current status of the recording
   * @returns {"ended"|"paused"|"recording"}
   */
  getStatus() {
    if (!this.processor) {
      return 'ended';
    } else if (!this.recording) {
      return 'paused';
    } else {
      return 'recording';
    }
  }

  /**
   * Sends an event to the AudioWorklet
   * @private
   * @param {string} name
   * @param {{[key: string]: any}} data
   * @param {AudioWorkletNode} [_processor]
   * @returns {Promise<{[key: string]: any}>}
   */
  async _event(name, data = {}, _processor = null) {
    _processor = _processor || this.processor;
    if (!_processor) {
      throw new Error('Can not send events without recording first');
    }
    const message = {
      event: name,
      id: this._lastEventId++,
      data,
    };
    _processor.port.postMessage(message);
    const t0 = new Date().valueOf();
    while (!this.eventReceipts[message.id]) {
      if (new Date().valueOf() - t0 > this.eventTimeout) {
        throw new Error(`Timeout waiting for "${name}" event`);
      }
      await new Promise((res) => setTimeout(() => res(true), 1));
    }
    const payload = this.eventReceipts[message.id];
    delete this.eventReceipts[message.id];
    return payload;
  }

  /**
   * Sets device change callback, remove if callback provided is `null`
   * @param {(Array<MediaDeviceInfo & {default: boolean}>): void|null} callback
   * @returns {true}
   */
  listenForDeviceChange(callback) {
    if (callback === null && this._deviceChangeCallback) {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        this._deviceChangeCallback,
      );
      this._deviceChangeCallback = null;
    } else if (callback !== null) {
      // Basically a debounce; we only want this called once when devices change
      // And we only want the most recent callback() to be executed
      // if a few are operating at the same time
      let lastId = 0;
      let lastDevices = [];
      const serializeDevices = (devices) =>
        devices
          .map((d) => d.deviceId)
          .sort()
          .join(',');
      const cb = async () => {
        let id = ++lastId;
        const devices = await this.listDevices();
        if (id === lastId) {
          if (serializeDevices(lastDevices) !== serializeDevices(devices)) {
            lastDevices = devices;
            callback(devices.slice());
          }
        }
      };
      navigator.mediaDevices.addEventListener('devicechange', cb);
      cb();
      this._deviceChangeCallback = cb;
    }
    return true;
  }

  /**
   * Manually request permission to use the microphone
   * @returns {Promise<true>}
   */
  async requestPermission() {
    const permissionStatus = await navigator.permissions.query({
      name: 'microphone',
    });
    if (permissionStatus.state === 'denied') {
      window.alert('You must grant microphone access to use this feature.');
    } else if (permissionStatus.state === 'prompt') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        window.alert('You must grant microphone access to use this feature.');
      }
    }
    return true;
  }

  /**
   * List all eligible devices for recording, will request permission to use microphone
   * @returns {Promise<Array<MediaDeviceInfo & {default: boolean}>>}
   */
  async listDevices() {
    if (
      !navigator.mediaDevices ||
      !('enumerateDevices' in navigator.mediaDevices)
    ) {
      throw new Error('Could not request user devices');
    }
    await this.requestPermission();
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(
      (device) => device.kind === 'audioinput',
    );
    const defaultDeviceIndex = audioDevices.findIndex(
      (device) => device.deviceId === 'default',
    );
    const deviceList = [];
    if (defaultDeviceIndex !== -1) {
      let defaultDevice = audioDevices.splice(defaultDeviceIndex, 1)[0];
      let existingIndex = audioDevices.findIndex(
        (device) => device.groupId === defaultDevice.groupId,
      );
      if (existingIndex !== -1) {
        defaultDevice = audioDevices.splice(existingIndex, 1)[0];
      }
      defaultDevice.default = true;
      deviceList.push(defaultDevice);
    }
    return deviceList.concat(audioDevices);
  }

  /**
   * Begins a recording session and requests microphone permissions if not already granted
   * Microphone recording indicator will appear on browser tab but status will be "paused"
   * @param {string} [deviceId] if no device provided, default device will be used
   * @returns {Promise<true>}
   */
  async begin(deviceId) {
    if (this.processor) {
      throw new Error(
        `Already connected: please call .end() to start a new session`,
      );
    }

    if (
      !navigator.mediaDevices ||
      !('getUserMedia' in navigator.mediaDevices)
    ) {
      throw new Error('Could not request user media');
    }
    try {
      const config = { audio: true };
      if (deviceId) {
        config.audio = { deviceId: { exact: deviceId } };
      }
      this.stream = await navigator.mediaDevices.getUserMedia(config);
    } catch (err) {
      throw new Error('Could not start media stream');
    }

    const context = new AudioContext({ sampleRate: this.sampleRate });
    const source = context.createMediaStreamSource(this.stream);
    // Load and execute the module script.
    try {
      await context.audioWorklet.addModule(this.scriptSrc);
    } catch (e) {
      console.error(e);
      throw new Error(`Could not add audioWorklet module: ${this.scriptSrc}`);
    }
    const processor = new AudioWorkletNode(context, 'audio_processor');
    processor.port.onmessage = (e) => {
      const { event, id, data } = e.data;
      if (event === 'receipt') {
        this.eventReceipts[id] = data;
      } else if (event === 'chunk') {
        if (this._chunkProcessorSize) {
          const buffer = this._chunkProcessorBuffer;
          this._chunkProcessorBuffer = {
            raw: WavPacker.mergeBuffers(buffer.raw, data.raw),
            mono: WavPacker.mergeBuffers(buffer.mono, data.mono),
          };
          if (
            this._chunkProcessorBuffer.mono.byteLength >=
            this._chunkProcessorSize
          ) {
            this._chunkProcessor(this._chunkProcessorBuffer);
            this._chunkProcessorBuffer = {
              raw: new ArrayBuffer(0),
              mono: new ArrayBuffer(0),
            };
          }
        } else {
          this._chunkProcessor(data);
        }
      }
    };

    const node = source.connect(processor);
    const analyser = context.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.1;
    node.connect(analyser);
    if (this.outputToSpeakers) {
      // eslint-disable-next-line no-console
      console.warn(
        'Warning: Output to speakers may affect sound quality,\n' +
          'especially due to system audio feedback preventative measures.\n' +
          'use only for debugging',
      );
      analyser.connect(context.destination);
    }

    this.source = source;
    this.node = node;
    this.analyser = analyser;
    this.processor = processor;
    return true;
  }

  /**
   * Gets the current frequency domain data from the recording track
   * @param {"frequency"|"music"|"voice"} [analysisType]
   * @param {number} [minDecibels] default -100
   * @param {number} [maxDecibels] default -30
   * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
   */
  getFrequencies(
    analysisType = 'frequency',
    minDecibels = -100,
    maxDecibels = -30,
  ) {
    if (!this.processor) {
      throw new Error('Session ended: please call .begin() first');
    }
    return AudioAnalysis.getFrequencies(
      this.analyser,
      this.sampleRate,
      null,
      analysisType,
      minDecibels,
      maxDecibels,
    );
  }

  /**
   * Pauses the recording
   * Keeps microphone stream open but halts storage of audio
   * @returns {Promise<true>}
   */
  async pause() {
    if (!this.processor) {
      throw new Error('Session ended: please call .begin() first');
    } else if (!this.recording) {
      throw new Error('Already paused: please call .record() first');
    }
    if (this._chunkProcessorBuffer.raw.byteLength) {
      this._chunkProcessor(this._chunkProcessorBuffer);
    }
    this.log('Pausing ...');
    await this._event('stop');
    this.recording = false;
    return true;
  }

  /**
   * Start recording stream and storing to memory from the connected audio source
   * @param {(data: { mono: Int16Array; raw: Int16Array }) => any} [chunkProcessor]
   * @param {number} [chunkSize] chunkProcessor will not be triggered until this size threshold met in mono audio
   * @returns {Promise<true>}
   */
  async record(chunkProcessor = () => {}, chunkSize = 8192) {
    if (!this.processor) {
      throw new Error('Session ended: please call .begin() first');
    } else if (this.recording) {
      throw new Error('Already recording: please call .pause() first');
    } else if (typeof chunkProcessor !== 'function') {
      throw new Error(`chunkProcessor must be a function`);
    }
    this._chunkProcessor = chunkProcessor;
    this._chunkProcessorSize = chunkSize;
    this._chunkProcessorBuffer = {
      raw: new ArrayBuffer(0),
      mono: new ArrayBuffer(0),
    };
    this.log('Recording ...');
    await this._event('start');
    this.recording = true;
    return true;
  }

  /**
   * Clears the audio buffer, empties stored recording
   * @returns {Promise<true>}
   */
  async clear() {
    if (!this.processor) {
      throw new Error('Session ended: please call .begin() first');
    }
    await this._event('clear');
    return true;
  }

  /**
   * Reads the current audio stream data
   * @returns {Promise<{meanValues: Float32Array, channels: Array<Float32Array>}>}
   */
  async read() {
    if (!this.processor) {
      throw new Error('Session ended: please call .begin() first');
    }
    this.log('Reading ...');
    const result = await this._event('read');
    return result;
  }

  /**
   * Saves the current audio stream to a file
   * @param {boolean} [force] Force saving while still recording
   * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
   */
  async save(force = false) {
    if (!this.processor) {
      throw new Error('Session ended: please call .begin() first');
    }
    if (!force && this.recording) {
      throw new Error(
        'Currently recording: please call .pause() first, or call .save(true) to force',
      );
    }
    this.log('Exporting ...');
    const exportData = await this._event('export');
    const packer = new WavPacker();
    const result = packer.pack(this.sampleRate, exportData.audio);
    return result;
  }

  /**
   * Ends the current recording session and saves the result
   * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
   */
  async end() {
    if (!this.processor) {
      throw new Error('Session ended: please call .begin() first');
    }

    const _processor = this.processor;

    this.log('Stopping ...');
    await this._event('stop');
    this.recording = false;
    const tracks = this.stream.getTracks();
    tracks.forEach((track) => track.stop());

    this.log('Exporting ...');
    const exportData = await this._event('export', {}, _processor);

    this.processor.disconnect();
    this.source.disconnect();
    this.node.disconnect();
    this.analyser.disconnect();
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.node = null;

    const packer = new WavPacker();
    const result = packer.pack(this.sampleRate, exportData.audio);
    return result;
  }

  /**
   * Performs a full cleanup of WavRecorder instance
   * Stops actively listening via microphone and removes existing listeners
   * @returns {Promise<true>}
   */
  async quit() {
    this.listenForDeviceChange(null);
    if (this.processor) {
      await this.end();
    }
    return true;
  }
}

globalThis.WavRecorder = WavRecorder;

```

## `src/lib/wavtools/lib/wav_stream_player.js`

```js
import { StreamProcessorSrc } from './worklets/stream_processor.js';
import { AudioAnalysis } from './analysis/audio_analysis.js';

/**
 * Plays audio streams received in raw PCM16 chunks from the browser
 * @class
 */
export class WavStreamPlayer {
  /**
   * Creates a new WavStreamPlayer instance
   * @param {{sampleRate?: number}} options
   * @returns {WavStreamPlayer}
   */
  constructor({ sampleRate = 44100 } = {}) {
    this.scriptSrc = StreamProcessorSrc;
    this.sampleRate = sampleRate;
    this.context = null;
    this.stream = null;
    this.analyser = null;
    this.trackSampleOffsets = {};
    this.interruptedTrackIds = {};
  }

  /**
   * Connects the audio context and enables output to speakers
   * @returns {Promise<true>}
   */
  async connect() {
    this.context = new AudioContext({ sampleRate: this.sampleRate });
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    try {
      await this.context.audioWorklet.addModule(this.scriptSrc);
    } catch (e) {
      console.error(e);
      throw new Error(`Could not add audioWorklet module: ${this.scriptSrc}`);
    }
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.1;
    this.analyser = analyser;
    return true;
  }

  /**
   * Gets the current frequency domain data from the playing track
   * @param {"frequency"|"music"|"voice"} [analysisType]
   * @param {number} [minDecibels] default -100
   * @param {number} [maxDecibels] default -30
   * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
   */
  getFrequencies(
    analysisType = 'frequency',
    minDecibels = -100,
    maxDecibels = -30
  ) {
    if (!this.analyser) {
      throw new Error('Not connected, please call .connect() first');
    }
    return AudioAnalysis.getFrequencies(
      this.analyser,
      this.sampleRate,
      null,
      analysisType,
      minDecibels,
      maxDecibels
    );
  }

  /**
   * Starts audio streaming
   * @private
   * @returns {Promise<true>}
   */
  _start() {
    const streamNode = new AudioWorkletNode(this.context, 'stream_processor');
    streamNode.connect(this.context.destination);
    streamNode.port.onmessage = (e) => {
      const { event } = e.data;
      if (event === 'stop') {
        streamNode.disconnect();
        this.stream = null;
      } else if (event === 'offset') {
        const { requestId, trackId, offset } = e.data;
        const currentTime = offset / this.sampleRate;
        this.trackSampleOffsets[requestId] = { trackId, offset, currentTime };
      }
    };
    this.analyser.disconnect();
    streamNode.connect(this.analyser);
    this.stream = streamNode;
    return true;
  }

  /**
   * Adds 16BitPCM data to the currently playing audio stream
   * You can add chunks beyond the current play point and they will be queued for play
   * @param {ArrayBuffer|Int16Array} arrayBuffer
   * @param {string} [trackId]
   * @returns {Int16Array}
   */
  add16BitPCM(arrayBuffer, trackId = 'default') {
    if (typeof trackId !== 'string') {
      throw new Error(`trackId must be a string`);
    } else if (this.interruptedTrackIds[trackId]) {
      return;
    }
    if (!this.stream) {
      this._start();
    }
    let buffer;
    if (arrayBuffer instanceof Int16Array) {
      buffer = arrayBuffer;
    } else if (arrayBuffer instanceof ArrayBuffer) {
      buffer = new Int16Array(arrayBuffer);
    } else {
      throw new Error(`argument must be Int16Array or ArrayBuffer`);
    }
    this.stream.port.postMessage({ event: 'write', buffer, trackId });
    return buffer;
  }

  /**
   * Gets the offset (sample count) of the currently playing stream
   * @param {boolean} [interrupt]
   * @returns {{trackId: string|null, offset: number, currentTime: number}}
   */
  async getTrackSampleOffset(interrupt = false) {
    if (!this.stream) {
      return null;
    }
    const requestId = crypto.randomUUID();
    this.stream.port.postMessage({
      event: interrupt ? 'interrupt' : 'offset',
      requestId,
    });
    let trackSampleOffset;
    while (!trackSampleOffset) {
      trackSampleOffset = this.trackSampleOffsets[requestId];
      await new Promise((r) => setTimeout(() => r(), 1));
    }
    const { trackId } = trackSampleOffset;
    if (interrupt && trackId) {
      this.interruptedTrackIds[trackId] = true;
    }
    return trackSampleOffset;
  }

  /**
   * Strips the current stream and returns the sample offset of the audio
   * @param {boolean} [interrupt]
   * @returns {{trackId: string|null, offset: number, currentTime: number}}
   */
  async interrupt() {
    return this.getTrackSampleOffset(true);
  }
}

globalThis.WavStreamPlayer = WavStreamPlayer;

```

## `src/lib/wavtools/lib/worklets/audio_processor.js`

```js
const AudioProcessorWorklet = `
class AudioProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = this.receive.bind(this);
    this.initialize();
  }

  initialize() {
    this.foundAudio = false;
    this.recording = false;
    this.chunks = [];
  }

  /**
   * Concatenates sampled chunks into channels
   * Format is chunk[Left[], Right[]]
   */
  readChannelData(chunks, channel = -1, maxChannels = 9) {
    let channelLimit;
    if (channel !== -1) {
      if (chunks[0] && chunks[0].length - 1 < channel) {
        throw new Error(
          \`Channel \${channel} out of range: max \${chunks[0].length}\`
        );
      }
      channelLimit = channel + 1;
    } else {
      channel = 0;
      channelLimit = Math.min(chunks[0] ? chunks[0].length : 1, maxChannels);
    }
    const channels = [];
    for (let n = channel; n < channelLimit; n++) {
      const length = chunks.reduce((sum, chunk) => {
        return sum + chunk[n].length;
      }, 0);
      const buffers = chunks.map((chunk) => chunk[n]);
      const result = new Float32Array(length);
      let offset = 0;
      for (let i = 0; i < buffers.length; i++) {
        result.set(buffers[i], offset);
        offset += buffers[i].length;
      }
      channels[n] = result;
    }
    return channels;
  }

  /**
   * Combines parallel audio data into correct format,
   * channels[Left[], Right[]] to float32Array[LRLRLRLR...]
   */
  formatAudioData(channels) {
    if (channels.length === 1) {
      // Simple case is only one channel
      const float32Array = channels[0].slice();
      const meanValues = channels[0].slice();
      return { float32Array, meanValues };
    } else {
      const float32Array = new Float32Array(
        channels[0].length * channels.length
      );
      const meanValues = new Float32Array(channels[0].length);
      for (let i = 0; i < channels[0].length; i++) {
        const offset = i * channels.length;
        let meanValue = 0;
        for (let n = 0; n < channels.length; n++) {
          float32Array[offset + n] = channels[n][i];
          meanValue += channels[n][i];
        }
        meanValues[i] = meanValue / channels.length;
      }
      return { float32Array, meanValues };
    }
  }

  /**
   * Converts 32-bit float data to 16-bit integers
   */
  floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  /**
   * Retrieves the most recent amplitude values from the audio stream
   * @param {number} channel
   */
  getValues(channel = -1) {
    const channels = this.readChannelData(this.chunks, channel);
    const { meanValues } = this.formatAudioData(channels);
    return { meanValues, channels };
  }

  /**
   * Exports chunks as an audio/wav file
   */
  export() {
    const channels = this.readChannelData(this.chunks);
    const { float32Array, meanValues } = this.formatAudioData(channels);
    const audioData = this.floatTo16BitPCM(float32Array);
    return {
      meanValues: meanValues,
      audio: {
        bitsPerSample: 16,
        channels: channels,
        data: audioData,
      },
    };
  }

  receive(e) {
    const { event, id } = e.data;
    let receiptData = {};
    switch (event) {
      case 'start':
        this.recording = true;
        break;
      case 'stop':
        this.recording = false;
        break;
      case 'clear':
        this.initialize();
        break;
      case 'export':
        receiptData = this.export();
        break;
      case 'read':
        receiptData = this.getValues();
        break;
      default:
        break;
    }
    // Always send back receipt
    this.port.postMessage({ event: 'receipt', id, data: receiptData });
  }

  sendChunk(chunk) {
    const channels = this.readChannelData([chunk]);
    const { float32Array, meanValues } = this.formatAudioData(channels);
    const rawAudioData = this.floatTo16BitPCM(float32Array);
    const monoAudioData = this.floatTo16BitPCM(meanValues);
    this.port.postMessage({
      event: 'chunk',
      data: {
        mono: monoAudioData,
        raw: rawAudioData,
      },
    });
  }

  process(inputList, outputList, parameters) {
    // Copy input to output (e.g. speakers)
    // Note that this creates choppy sounds with Mac products
    const sourceLimit = Math.min(inputList.length, outputList.length);
    for (let inputNum = 0; inputNum < sourceLimit; inputNum++) {
      const input = inputList[inputNum];
      const output = outputList[inputNum];
      const channelCount = Math.min(input.length, output.length);
      for (let channelNum = 0; channelNum < channelCount; channelNum++) {
        input[channelNum].forEach((sample, i) => {
          output[channelNum][i] = sample;
        });
      }
    }
    const inputs = inputList[0];
    // There's latency at the beginning of a stream before recording starts
    // Make sure we actually receive audio data before we start storing chunks
    let sliceIndex = 0;
    if (!this.foundAudio) {
      for (const channel of inputs) {
        sliceIndex = 0; // reset for each channel
        if (this.foundAudio) {
          break;
        }
        if (channel) {
          for (const value of channel) {
            if (value !== 0) {
              // find only one non-zero entry in any channel
              this.foundAudio = true;
              break;
            } else {
              sliceIndex++;
            }
          }
        }
      }
    }
    if (inputs && inputs[0] && this.foundAudio && this.recording) {
      // We need to copy the TypedArray, because the \`process\`
      // internals will reuse the same buffer to hold each input
      const chunk = inputs.map((input) => input.slice(sliceIndex));
      this.chunks.push(chunk);
      this.sendChunk(chunk);
    }
    return true;
  }
}

registerProcessor('audio_processor', AudioProcessor);
`;

const script = new Blob([AudioProcessorWorklet], {
  type: 'application/javascript',
});
const src = URL.createObjectURL(script);
export const AudioProcessorSrc = src;

```

## `src/lib/wavtools/lib/worklets/stream_processor.js`

```js
export const StreamProcessorWorklet = `
class StreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.hasStarted = false;
    this.hasInterrupted = false;
    this.outputBuffers = [];
    this.bufferLength = 128;
    this.write = { buffer: new Float32Array(this.bufferLength), trackId: null };
    this.writeOffset = 0;
    this.trackSampleOffsets = {};
    this.port.onmessage = (event) => {
      if (event.data) {
        const payload = event.data;
        if (payload.event === 'write') {
          const int16Array = payload.buffer;
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 0x8000; // Convert Int16 to Float32
          }
          this.writeData(float32Array, payload.trackId);
        } else if (
          payload.event === 'offset' ||
          payload.event === 'interrupt'
        ) {
          const requestId = payload.requestId;
          const trackId = this.write.trackId;
          const offset = this.trackSampleOffsets[trackId] || 0;
          this.port.postMessage({
            event: 'offset',
            requestId,
            trackId,
            offset,
          });
          if (payload.event === 'interrupt') {
            this.hasInterrupted = true;
          }
        } else {
          throw new Error(\`Unhandled event "\${payload.event}"\`);
        }
      }
    };
  }

  writeData(float32Array, trackId = null) {
    let { buffer } = this.write;
    let offset = this.writeOffset;
    for (let i = 0; i < float32Array.length; i++) {
      buffer[offset++] = float32Array[i];
      if (offset >= buffer.length) {
        this.outputBuffers.push(this.write);
        this.write = { buffer: new Float32Array(this.bufferLength), trackId };
        buffer = this.write.buffer;
        offset = 0;
      }
    }
    this.writeOffset = offset;
    return true;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannelData = output[0];
    const outputBuffers = this.outputBuffers;
    if (this.hasInterrupted) {
      this.port.postMessage({ event: 'stop' });
      return false;
    } else if (outputBuffers.length) {
      this.hasStarted = true;
      const { buffer, trackId } = outputBuffers.shift();
      for (let i = 0; i < outputChannelData.length; i++) {
        outputChannelData[i] = buffer[i] || 0;
      }
      if (trackId) {
        this.trackSampleOffsets[trackId] =
          this.trackSampleOffsets[trackId] || 0;
        this.trackSampleOffsets[trackId] += buffer.length;
      }
      return true;
    } else if (this.hasStarted) {
      this.port.postMessage({ event: 'stop' });
      return false;
    } else {
      return true;
    }
  }
}

registerProcessor('stream_processor', StreamProcessor);
`;

const script = new Blob([StreamProcessorWorklet], {
  type: 'application/javascript',
});
const src = URL.createObjectURL(script);
export const StreamProcessorSrc = src;

```

## `src/logo.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3"><g fill="#61DAFB"><path d="M666.3 296.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4-6.5-3.8-14.1-5.6-22.4-5.6v22.3c4.6 0 8.3.9 11.4 2.6 13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4-19.6-4.8-41-8.5-63.5-10.9-13.5-18.5-27.5-35.3-41.6-50 32.6-30.3 63.2-46.9 84-46.9V78c-27.5 0-63.5 19.6-99.9 53.6-36.4-33.8-72.4-53.2-99.9-53.2v22.3c20.7 0 51.4 16.5 84 46.6-14 14.7-28 31.4-41.3 49.9-22.6 2.4-44 6.1-63.6 11-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V78.5c-8.4 0-16 1.8-22.6 5.6-28.1 16.2-34.4 66.7-19.9 130.1-62.2 19.2-102.7 49.9-102.7 82.3 0 32.5 40.7 63.3 103.1 82.4-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2 8.4 0 16-1.8 22.6-5.6 28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24-4.6-8-9.5-15.8-14.4-23.4 14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2-15.1 0-30.2-.7-45-1.9-8.3-11.9-16.4-24.6-24.2-38-7.6-13.1-14.5-26.4-20.8-39.8 6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2 15.1 0 30.2.7 45 1.9 8.3 11.9 16.4 24.6 24.2 38 7.6 13.1 14.5 26.4 20.8 39.8-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7 4.6-8 8.9-16.1 13-24.1zM421.2 430c-9.3-9.6-18.6-20.3-27.8-32 9 .4 18.2.7 27.5.7 9.4 0 18.7-.2 27.8-.7-9 11.7-18.3 22.4-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24 4.7 8 9.5 15.8 14.4 23.4zM420.7 163c9.3 9.6 18.6 20.3 27.8 32-9-.4-18.2-.7-27.5-.7-9.4 0-18.7.2-27.8.7 9-11.7 18.3-22.4 27.5-32zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7-4.6 8-8.9 16-13 24-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zm-90.5 125.2c-35.4-15.1-58.3-34.9-58.3-50.6 0-15.7 22.9-35.6 58.3-50.6 8.6-3.7 18-7 27.7-10.1 5.7 19.6 13.2 40 22.5 60.9-9.2 20.8-16.6 41.1-22.2 60.6-9.9-3.1-19.3-6.5-28-10.2zM310 490c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4 19.6 4.8 41 8.5 63.5 10.9 13.5 18.5 27.5 35.3 41.6 50-32.6 30.3-63.2 46.9-84 46.9-4.5-.1-8.3-1-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6 14-14.7 28-31.4 41.3-49.9 22.6-2.4 44-6.1 63.6-11 2.3 10.1 4.1 19.8 5.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1-5.7-19.6-13.2-40-22.5-60.9 9.2-20.8 16.6-41.1 22.2-60.6 9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6-.1 15.7-23 35.6-58.4 50.6zM320.8 78.4z"/><circle cx="420.9" cy="296.5" r="45.7"/><path d="M520.5 78.1z"/></g></svg>
```

## `src/pages/ConsolePage.scss`

```scss
[data-component='ConsolePage'] {
  font-family: 'Roboto Mono', monospace;
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0px 8px;
  & > div {
    flex-shrink: 0;
  }

  .spacer {
    flex-grow: 1;
  }

  .content-top {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    min-height: 40px;
    .content-title {
      flex-grow: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      img {
        width: 24px;
        height: 24px;
      }
    }
  }

  .content-main {
    flex-grow: 1;
    flex-shrink: 1 !important;
    margin: 0px 16px;
    display: flex;
    overflow: hidden;
    margin-bottom: 24px;
    .content-block {
      position: relative;
      display: flex;
      flex-direction: column;
      max-height: 100%;
      width: 100%;
      .content-block-title {
        flex-shrink: 0;
        padding-top: 16px;
        padding-bottom: 4px;
        position: relative;
      }
      .content-block-body {
        color: #6e6e7f;
        position: relative;
        flex-grow: 1;
        padding: 8px 0px;
        padding-top: 4px;
        line-height: 1.2em;
        overflow: auto;
        &.full {
          padding: 0px;
        }
      }
    }
    .content-right {
      width: 300px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      margin-left: 24px;
      gap: 24px;
      & > div {
        border-radius: 16px;
        flex-grow: 1;
        flex-shrink: 0;
        overflow: hidden;
        position: relative;
        .content-block-title {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 2em;
          top: 16px;
          left: 16px;
          padding: 4px 16px;
          background-color: #fff;
          border-radius: 1000px;
          min-height: 32px;
          z-index: 9999;
          text-align: center;
          white-space: pre;
          &.bottom {
            top: auto;
            bottom: 16px;
            right: 16px;
          }
        }
      }
      & > div.kv {
        height: 250px;
        max-height: 250px;
        white-space: pre;
        background-color: #ececf1;
        .content-block-body {
          padding: 16px;
          margin-top: 56px;
        }
      }
    }
    .content-logs {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      & > div {
        flex-grow: 1;
      }
      & > .content-actions {
        flex-grow: 0;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
      }
      & > div.events {
        overflow: hidden;
      }
      .events {
        border-top: 1px solid #e7e7e7;
      }
      .conversation {
        display: flex;
        flex-shrink: 0;
        width: 100%;
        overflow: hidden;
        height: 200px;
        min-height: 0;
        max-height: 200px;
        border-top: 1px solid #e7e7e7;
      }
    }
  }

  .conversation-item {
    position: relative;
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    &:not(:hover) .close {
      display: none;
    }
    .close {
      position: absolute;
      top: 0px;
      right: -20px;
      background: #aaa;
      color: #fff;
      display: flex;
      border-radius: 16px;
      padding: 2px;
      cursor: pointer;
      &:hover {
        background: #696969;
      }
      svg {
        stroke-width: 3;
        width: 12px;
        height: 12px;
      }
    }
    .speaker {
      position: relative;
      text-align: left;
      gap: 16px;
      width: 80px;
      flex-shrink: 0;
      margin-right: 16px;
      &.user {
        color: #0099ff;
      }
      &.assistant {
        color: #009900;
      }
    }
    .speaker-content {
      color: #18181b;
      overflow: hidden;
      word-wrap: break-word;
    }
  }

  .event {
    border-radius: 3px;
    white-space: pre;
    display: flex;
    padding: 0px;
    gap: 16px;
    .event-timestamp {
      text-align: left;
      gap: 8px;
      padding: 4px 0px;
      width: 80px;
      flex-shrink: 0;
      margin-right: 16px;
    }
    .event-details {
      display: flex;
      flex-direction: column;
      color: #18181b;
      gap: 8px;
      .event-summary {
        padding: 4px 8px;
        margin: 0px -8px;
        &:hover {
          border-radius: 8px;
          background-color: #f0f0f0;
        }
        cursor: pointer;
        display: flex;
        gap: 8px;
        align-items: center;
        .event-source {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          &.client {
            color: #0099ff;
          }
          &.server {
            color: #009900;
          }
          &.error {
            color: #990000;
          }
          svg {
            stroke-width: 3;
            width: 12px;
            height: 12px;
          }
        }
      }
    }
  }

  .visualization {
    position: absolute;
    display: flex;
    bottom: 4px;
    right: 8px;
    padding: 4px;
    border-radius: 16px;
    z-index: 10;
    gap: 2px;
    .visualization-entry {
      position: relative;
      display: flex;
      align-items: center;
      height: 40px;
      width: 100px;
      gap: 4px;
      &.client {
        color: #0099ff;
      }
      &.server {
        color: #009900;
      }
      canvas {
        width: 100%;
        height: 100%;
        color: currentColor;
      }
    }
  }

  .voice-indicator {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 60px;
    height: 60px;
    background-color: #0099ff;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.9);
    }
    50% {
      transform: scale(1);
    }
    100% {
      transform: scale(0.9);
    }
  }
}

@media (max-width: 600px) {
    [data-component='ConsolePage'] {
        font-size: 14px;
        /* 其他移动端样式调整 */

        /* 优化语音指示器 */
        .voice-indicator {
            bottom: 10px;
            right: 10px;
            .voice-ball {
                width: 40px;
                height: 40px;
            }
        }

        /* 调整按钮大小和间距 */
        .content-actions {
            flex-direction: column;
            gap: 12px;
            button {
                width: 100%;
                padding: 10px 0;
                font-size: 16px;
            }
        }

        /* 优化对话区域的布局 */
        .content-main {
            margin: 0px 8px;
            flex-direction: column;
        }

        .conversation {
            height: 150px;
            max-height: 150px;
        }

        /* 调整事件日志区域 */
        .events {
            font-size: 12px;
        }

        /* 隐藏不必要的侧边栏内容 */
        .content-right {
            display: none;
        }
    }
}

@media (max-width: 768px) {
  .content-block.events {
    display: none;
  }
}

```

## `src/pages/ConsolePage.tsx`

```tsx
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

    // Connect to audio output
    await wavStreamPlayer.connect();

    try {
      // Connect to Realtime API
      await client.connect();
    } catch (error) {
      console.error('Failed to connect to Realtime API:', error);
      return;
    }

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
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }

    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `你好！`,
      },
    ]);
  }, [isVoiceMode]);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    setIsVoiceMode(false);
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    if (wavRecorder.getStatus() !== 'ended') {
      await wavRecorder.end();
    }

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
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    const wavRecorder = wavRecorderRef.current;

    try {
      if (wavRecorder.getStatus() === 'recording') {
        console.log('Stopping recording...');
        await wavRecorder.pause();
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

    if (!toolAddedRef.current) {
      client.updateSession({
        instructions: instructions,
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { type: 'server_vad' },
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

      toolAddedRef.current = true;
    }

    // 其他事件处理...

    // 组件卸载时移除工具
    return () => {
      client.removeTool('set_memory');
    };

  }, []); // 保持空的依赖数组

  useEffect(() => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;

    const handleAudioInput = (data: { mono: Int16Array; raw: Int16Array }) => {
      if (client.isConnected()) {
        client.appendInputAudio(data.mono);
      } else {
        console.warn('Client is not connected. Audio data not sent.');
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
    // 其他初始化代码...

    // 自动连接
    connectConversation();

    // 在组件卸载时断开连接
    return () => {
      disconnectConversation();
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

```

## `src/react-app-env.d.ts`

```ts
/// <reference types="react-scripts" />

```

## `src/reportWebVitals.ts`

```ts
import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

```

## `src/setupTests.ts`

```ts
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

```

## `src/utils/conversation_config.js`

```js
export const instructions = `系统设置：
你是一个名为Lumin的AI Teaching Assistant，专门设计用来帮助老师和学生的智能助教。你的主要职责是通过对话来协助教学和学习过程。

角色定位：
- 你是一个全面的教育助手，能够处理各种与教学相关的任务。
- 虽然你有多种功能，但目前主要集中在聊天和教学方面。

主要功能：
1. 教学支持：
   - 解答学生的问题，提供详细且易懂的解释。
   - 协助教师制定教学计划和课程内容。
   - 提供个性化的学习建议和资源推荐。

2. 作业管理（未开放）：
   - 协助创建、分配和跟踪作业。
   - 提醒学生完成作业，并生成作业报告。

3. 课堂通知（未开放）：
   - 发送重要的课堂通知和提醒。

4. 信息检索：
   - 使用"search_wikipedia"函数搜索维基百科，以提供准确的补充信息。
   - 当被问及未知信息时，主动使用此功能获取相关知识。

5. 语音交互：
   - 通过音频提供清晰、有帮助的语音回复。

6. 日程管理（未开放）：
   - 协助教师和学生管理课程表和学习计划。
   - 提供日程提醒和时间管理建议。

个性特征：
- 积极向上，富有耐心和同理心。
- 说话清晰，解释详尽，适应不同学习者的需求。
- 鼓励性强，激发学生的学习兴趣和好奇心。
- 专业且友好，维持适当的师生关系。

交互指南：
- 始终保持友善和耐心，鼓励用户提问和探索。
- 根据用户的需求和背景调整回答的复杂度。
- 使用可用的工具和功能来增强对话效果，提供最佳的学习体验。
- 在处理敏感话题时保持中立和客观。
- 如遇到不确定的情况，诚实承认并使用"search_wikipedia"功能寻找答案。
- 当被问及未开放的功能（如作业管理、课堂通知、日程管理）时，礼貌地解释这些功能尚未开放，但会在未来添加。

安全和隐私：
- 严格保护用户的隐私和个人信息。
- 遵守教育相关的法律和道德准则。

持续学习：
- 保持对教育领域最新发展的关注，不断更新知识库。
- 根据用户反馈持续优化回答质量和交互方式。

你的目标是成为一个全面、有效的教育助手，通过智能化的支持来提升教学质量和学习效果。在回答问题时，如果需要补充信息，请主动使用"search_wikipedia"功能获取相关知识，以确保提供最新、最准确的信息。`;

```

## `src/utils/wav_renderer.ts`

```ts
const dataMap = new WeakMap();

/**
 * Normalizes a Float32Array to Array(m): We use this to draw amplitudes on a graph
 * If we're rendering the same audio data, then we'll often be using
 * the same (data, m, downsamplePeaks) triplets so we give option to memoize
 */
const normalizeArray = (
  data: Float32Array,
  m: number,
  downsamplePeaks: boolean = false,
  memoize: boolean = false
) => {
  let cache, mKey, dKey;
  if (memoize) {
    mKey = m.toString();
    dKey = downsamplePeaks.toString();
    cache = dataMap.has(data) ? dataMap.get(data) : {};
    dataMap.set(data, cache);
    cache[mKey] = cache[mKey] || {};
    if (cache[mKey][dKey]) {
      return cache[mKey][dKey];
    }
  }
  const n = data.length;
  const result = new Array(m);
  if (m <= n) {
    // Downsampling
    result.fill(0);
    const count = new Array(m).fill(0);
    for (let i = 0; i < n; i++) {
      const index = Math.floor(i * (m / n));
      if (downsamplePeaks) {
        // take highest result in the set
        result[index] = Math.max(result[index], Math.abs(data[i]));
      } else {
        result[index] += Math.abs(data[i]);
      }
      count[index]++;
    }
    if (!downsamplePeaks) {
      for (let i = 0; i < result.length; i++) {
        result[i] = result[i] / count[i];
      }
    }
  } else {
    for (let i = 0; i < m; i++) {
      const index = (i * (n - 1)) / (m - 1);
      const low = Math.floor(index);
      const high = Math.ceil(index);
      const t = index - low;
      if (high >= n) {
        result[i] = data[n - 1];
      } else {
        result[i] = data[low] * (1 - t) + data[high] * t;
      }
    }
  }
  if (memoize) {
    cache[mKey as string][dKey as string] = result;
  }
  return result;
};

export const WavRenderer = {
  /**
   * Renders a point-in-time snapshot of an audio sample, usually frequency values
   * @param canvas
   * @param ctx
   * @param data
   * @param color
   * @param pointCount number of bars to render
   * @param barWidth width of bars in px
   * @param barSpacing spacing between bars in px
   * @param center vertically center the bars
   */
  drawBars: (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    data: Float32Array,
    color: string,
    pointCount: number = 0,
    barWidth: number = 0,
    barSpacing: number = 0,
    center: boolean = false
  ) => {
    pointCount = Math.floor(
      Math.min(
        pointCount,
        (canvas.width - barSpacing) / (Math.max(barWidth, 1) + barSpacing)
      )
    );
    if (!pointCount) {
      pointCount = Math.floor(
        (canvas.width - barSpacing) / (Math.max(barWidth, 1) + barSpacing)
      );
    }
    if (!barWidth) {
      barWidth = (canvas.width - barSpacing) / pointCount - barSpacing;
    }
    const points = normalizeArray(data, pointCount, true);
    for (let i = 0; i < pointCount; i++) {
      const amplitude = Math.abs(points[i]);
      const height = Math.max(1, amplitude * canvas.height);
      const x = barSpacing + i * (barWidth + barSpacing);
      const y = center ? (canvas.height - height) / 2 : canvas.height - height;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, height);
    }
  },
};

```

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext", "ES2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "src/lib"]
}

```
