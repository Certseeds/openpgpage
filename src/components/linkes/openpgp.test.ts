import * as openpgp from 'openpgp';

import { getEncryKeyFromText } from '@/components/linkes/openpgp';

test('test encrypt and get KeyID', async () => {
  const key = await fetch('https://blog.certseeds.com/public.key', {
    method: 'GET',
  }).then(body => body.text());;
  expect(key).not.toEqual('');
  const encry = async (input: string) => {
    const encrypted = await openpgp.encrypt({
      message: (await openpgp.createMessage({ text: input })), // input as Message object
      encryptionKeys: await openpgp.readKey({ armoredKey: key })
    });
    console.log(encrypted);
    return encrypted;
  }
  expect(encry).not.toEqual(null);
  const encryptText = (await encry('')) as string;
  const keyIdStr = await getEncryKeyFromText(encryptText);
  console.log(keyIdStr)
  expect(keyIdStr).toEqual('5da6c2d9abbbd244');
})
