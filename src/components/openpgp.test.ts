import { getKeyCanEncryptAndNotRevoked, getEncryKeyFromText } from '@/components/openpgp';
import * as openpgp from 'openpgp';

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

test('test encrypt and get KeyID', async () => {
  const key = await fetch('https://api.github.com/users/Certseeds/gpg_keys', {
    method: 'GET',
  }).then(body => body.json());
  const result = getKeyCanEncryptAndNotRevoked(key);
  expect(result).not.toEqual({});
  expect(result.raw_key).not.toEqual('');
  const ownKey = result.raw_key ?? '';
  expect(ownKey).not.toEqual('');
  const encry = async (input: string) => {
    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: input }), // input as Message object
      encryptionKeys: await openpgp.readKey({ armoredKey: ownKey })
    });
    console.log(encrypted);
    return encrypted;
  }
  expect(encry).not.toEqual(null);
  const encryptText = (await encry('')) as string;
  const keyIdStr = await getEncryKeyFromText(encryptText);
  expect(keyIdStr).toEqual('5da6c2d9abbbd244');
})
