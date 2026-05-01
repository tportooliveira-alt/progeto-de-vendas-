/**
 * Publisher — pega pecas prontas e agenda no Metricool.
 */
import { schedulePost } from '../../../lib/integrations/metricool.mjs';

/**
 * @param {Object[]} posts - [{ text, providers, mediaUrls, publicationDate }]
 */
export async function runPublisher({ posts = [] }) {
  const results = [];
  for (const post of posts) {
    try {
      const r = await schedulePost(post);
      results.push({ ok: true, id: r.id || r, post });
    } catch (e) {
      results.push({ ok: false, error: e.message, post });
    }
  }
  return results;
}
