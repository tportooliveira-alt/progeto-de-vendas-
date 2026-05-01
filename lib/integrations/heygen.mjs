/**
 * lib/integrations/heygen.mjs
 * Geracao de videos com avatar via HeyGen.
 * Docs: https://docs.heygen.com/
 */
import 'dotenv/config';
import axios from 'axios';

const BASE = 'https://api.heygen.com/v2';
const KEY = process.env.HEYGEN_API_KEY;

function client() {
  if (!KEY) throw new Error('Configure HEYGEN_API_KEY no .env');
  return axios.create({
    baseURL: BASE,
    headers: { 'X-Api-Key': KEY, 'Content-Type': 'application/json' },
    timeout: 60000
  });
}

/**
 * Gera video com avatar falando o texto.
 * @param {Object} p
 * @param {string} p.script - texto pra falar (max ~1500 chars)
 * @param {string} p.avatarId - ID do avatar
 * @param {string} p.voiceId - ID da voz
 * @param {string} [p.background] - cor hex ou URL imagem
 * @returns {Promise<{video_id:string}>}
 */
export async function generateVideo({ script, avatarId, voiceId, background = '#ffffff', dimension = { width: 1080, height: 1920 } }) {
  const c = client();
  const { data } = await c.post('/video/generate', {
    video_inputs: [{
      character: { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
      voice: { type: 'text', input_text: script, voice_id: voiceId },
      background: typeof background === 'string' && background.startsWith('#')
        ? { type: 'color', value: background }
        : { type: 'image', url: background }
    }],
    dimension,
    test: false
  });
  return data.data; // { video_id }
}

export async function getVideoStatus(videoId) {
  const c = client();
  const { data } = await c.get(`/video_status.get?video_id=${videoId}`);
  return data.data; // { status: 'completed'|'processing', video_url? }
}

export async function listAvatars() {
  const c = client();
  const { data } = await c.get('/avatars');
  return data.data;
}
