import { describe, it, expect, vi, afterEach } from 'vitest';
import { isBarcodeDetectionSupported, createBarcodeDetector, lookupBarcodeProduct } from './barcodeScan';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isBarcodeDetectionSupported', () => {
  it('is false when the browser has no BarcodeDetector API', () => {
    expect(isBarcodeDetectionSupported()).toBe(false);
  });
});

describe('createBarcodeDetector', () => {
  it('returns null when BarcodeDetector is unsupported', () => {
    expect(createBarcodeDetector()).toBeNull();
  });
});

describe('lookupBarcodeProduct', () => {
  it('returns null when neither database has the product', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const result = await lookupBarcodeProduct('0000000000000');
    expect(result).toBeNull();
  });

  it('prefers the Open Beauty Facts result when it has ingredients', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: {
          product_name: 'Nemlendirici Krem',
          brands: 'CeraVe',
          ingredients_text_tr: 'Aqua, Ceramide'
        }
      })
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupBarcodeProduct('1234567890123');
    expect(result).toEqual({ productName: 'Nemlendirici Krem', brand: 'CeraVe', ingredientsText: 'Aqua, Ceramide' });
    expect(fetchMock.mock.calls[0][0]).toContain('openbeautyfacts.org');
  });

  it('falls back to Open Food Facts when the beauty database has no usable data', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 0 }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 1,
          product: { product_name: 'Fındık Ezmesi', brands: 'Markasız', ingredients_text: 'Fındık, Şeker' }
        })
      });
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupBarcodeProduct('9999999999999');
    expect(result).toEqual({ productName: 'Fındık Ezmesi', brand: 'Markasız', ingredientsText: 'Fındık, Şeker' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('openfoodfacts.org');
  });

  it('treats a network error as "no result" instead of throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const result = await lookupBarcodeProduct('1234567890123');
    expect(result).toBeNull();
  });
});
