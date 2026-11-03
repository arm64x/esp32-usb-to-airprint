import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localeConfig, messages, resolveLocale, translate } from '../src/lib/i18n.ts';
const placeholders = (s: string) => [...new Set(s.match(/\{\w+\}/g) || [])].sort();
test('translations preserve all named parameters', () => {
  for (const [locale, cfg] of Object.entries(localeConfig)) {
    if (!cfg.messages) continue;
    assert.deepEqual(Object.keys(cfg.messages).sort(), Object.keys(messages).sort(), `${locale}: same keys as vi`);
    for (const [english, text] of Object.entries(cfg.messages)) {
      assert.ok(text.trim(), `${locale}: empty translation: ${english}`);
      assert.deepEqual(placeholders(text), placeholders(english), `${locale}: ${english}`);
    }
  }
});
test('saved choice wins, browser preferences are negotiated, unknown languages fall back', () => {
  assert.equal(resolveLocale('en', ['vi']), 'en');
  assert.equal(resolveLocale('vi', ['en-US']), 'vi');
  assert.equal(resolveLocale(null, ['fr', 'vi-VN', 'en']), 'vi');
  assert.equal(resolveLocale(null, ['en-GB', 'vi']), 'en');
  assert.equal(resolveLocale('invalid', ['ja']), 'en');
  assert.equal(resolveLocale(null, []), 'en');
});
test('parameters are literal and English uses the source message', () => {
  assert.equal(translate('en', 'Ready · {ink} ink low', { ink: '$&{ink}' }), 'Ready · $&{ink} ink low');
  assert.equal(translate('vi', 'Scanning · {percent}%', { percent: 42 }), 'Đang quét · 42%');
  assert.equal(translate('en', 'Scanning · {percent}%', { percent: 42 }), 'Scanning · 42%');
});
