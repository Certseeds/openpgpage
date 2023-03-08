import { getKeyCanEncryptAndNotRevoked } from '@/components/openpgp';

test('test empty array', () => {
  const emptyArrayFromString = JSON.parse('[]');
  const result = getKeyCanEncryptAndNotRevoked(emptyArrayFromString);
  expect(result).toEqual({})
})

test('test empty object', () => {
  const emptyObjectFromString = JSON.parse('{}');

  const result = getKeyCanEncryptAndNotRevoked(emptyObjectFromString);
  expect(result).toEqual({})
})

test('test webflow gpg keys', async () => {
  const webflow = await fetch('https://api.github.com/users/web-flow/gpg_keys', {
    method: 'GET',
  }).then(body => body.json());

  const result = getKeyCanEncryptAndNotRevoked(webflow);
  expect(result).toEqual({})
})

test('test certseeds gpg keys', async () => {
  const key = await fetch('https://api.github.com/users/Certseeds/gpg_keys', {
    method: 'GET',
  }).then(body => body.json());
  const result = getKeyCanEncryptAndNotRevoked(key);
  expect(result).not.toEqual({});
  expect(result.raw_key).not.toEqual('');
})
