/**
 * lib/integrations/elevenlabs.mjs
 * Geracao de audio (voz natural) via ElevenLabs.
 * Docs: https://elevenlabs.io/docs/api-reference
 */
import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BASE = 'https://api.elevenlabs.io/v1';
const KEY = process.env.ELEVENLABS_API_KEY;

function client(responseType = 'json') {
  if (!KEY) throw new Error('Configure ELEVENLABS_API_KEY no .env');
  return axios.create({
    baseURL: BASE,
    headers: { 'xi-api-key': KEY },
    timeout: 60000,
    responseType
  });
}

/**
 * Gera audio mp3 e salva no caminho informado.
 */
export async function textToSpeech({ text, voiceId, outputPath, modelId = 'eleven_multilingual_v2', stability = 0.5, similarity = 0.75 }) {
  const c = client('arraybuffer');
  const { data } = await c.post(`/text-to-speech/${voiceId}`, {
    text,
    model_id: modelId,
    voice_settings: { stability, similarity_boost: similarity }
  }, { headers: { 'Content-Type': 'application/json', accept: 'audio/mpeg' } });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(data));
  return outputPath;
}

export async function listVoices() {
  const c = client();
  const { data } = await c.get('/voices');
  return data.voices;
}
