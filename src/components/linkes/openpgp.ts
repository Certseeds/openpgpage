import { readMessage, } from 'openpgp/lightweight';
const getEncryKeyFromText: (text: string) => Promise<string> = async (text: string) => {
  if (0 === (text.length ?? 0)) {
    return '';
  }
  const encryptText = await readMessage({ armoredMessage: text });
  const keyIds = await encryptText.getEncryptionKeyIDs();
  const keyIdHex = keyIds.map(keyId => keyId.toHex());
  const idListStr = keyIdHex.join(',');
  return idListStr;
}
export { getEncryKeyFromText };
