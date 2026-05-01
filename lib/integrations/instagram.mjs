/**
 * lib/integrations/instagram.mjs
 * Instagram Graph API (Business/Creator)
 */
import axios from 'axios';

const BASE_URL = process.env.INSTAGRAM_GRAPH_BASE_URL || 'https://graph.facebook.com/v22.0';

function requireInstagramEnv() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!accessToken) throw new Error('INSTAGRAM_ACCESS_TOKEN nao configurado');
  if (!igUserId) throw new Error('INSTAGRAM_BUSINESS_ACCOUNT_ID nao configurado');
  return { accessToken, igUserId };
}

export async function getInstagramProfile() {
  const { accessToken, igUserId } = requireInstagramEnv();
  const fields = 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url';
  const { data } = await axios.get(`${BASE_URL}/${igUserId}`, {
    params: { fields, access_token: accessToken },
    timeout: 15000
  });
  return data;
}

export async function listInstagramMedia(limit = 10) {
  const { accessToken, igUserId } = requireInstagramEnv();
  const { data } = await axios.get(`${BASE_URL}/${igUserId}/media`, {
    params: {
      fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
      limit,
      access_token: accessToken
    },
    timeout: 15000
  });
  return data?.data || [];
}

export async function getInstagramMediaInsights(mediaId) {
  if (!mediaId) throw new Error('mediaId obrigatorio');
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) throw new Error('INSTAGRAM_ACCESS_TOKEN nao configurado');

  const { data } = await axios.get(`${BASE_URL}/${mediaId}/insights`, {
    params: {
      metric: 'impressions,reach,saved,shares,total_interactions',
      access_token: accessToken
    },
    timeout: 15000
  });
  return data?.data || [];
}
