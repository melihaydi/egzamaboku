import { describe, it, expect, vi, afterEach } from 'vitest';
import { getAssistantReply, searchOnlineFallback } from './eczemaAssistant';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getAssistantReply', () => {
  it('answers short greetings instantly without calling the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const reply = await getAssistantReply('merhaba');
    expect(reply.source).toBe('greeting');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers short thanks messages instantly without calling the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const reply = await getAssistantReply('çok teşekkürler');
    expect(reply.source).toBe('thanks');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns the guidance message for an empty question without calling the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const reply = await getAssistantReply('   ');
    expect(reply.source).toBe('none');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('routes real questions to Gemini via the Netlify function', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: 'Gemini yanıtı burada.' })
    });
    vi.stubGlobal('fetch', fetchMock);

    const reply = await getAssistantReply('nemlendirici ne zaman sürmeliyim');
    expect(reply.source).toBe('gemini');
    expect(reply.text).toBe('Gemini yanıtı burada.');
    expect(fetchMock.mock.calls[0][0]).toBe('/.netlify/functions/gemini-chat');
  });

  it('falls back to Wikipedia when Gemini is unavailable', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false }) // gemini-chat fails
      .mockResolvedValueOnce({ ok: true, json: async () => ({ query: { search: [{ title: 'Egzama' }] } }) }) // wiki search
      .mockResolvedValueOnce({ ok: true, json: async () => ({ extract: 'Egzama hakkında bir özet.' }) }); // wiki summary
    vi.stubGlobal('fetch', fetchMock);

    const reply = await getAssistantReply('egzama nedir');
    expect(reply.source).toBe('online');
    expect(reply.text).toContain('Egzama hakkında bir özet.');
  });

  it('never claims ignorance when everything fails, and suggests retrying', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const reply = await getAssistantReply('egzama nedir');
    expect(reply.source).toBe('none');
    expect(reply.text).not.toMatch(/bilmiyorum|bilgim yok/i);
  });
});

describe('searchOnlineFallback', () => {
  it('returns null when Wikipedia has no matching article', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ query: { search: [] } }) }));
    const result = await searchOnlineFallback('tamamen alakasiz bir sorgu');
    expect(result).toBeNull();
  });
});
