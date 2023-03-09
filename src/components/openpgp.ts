import * as openpgp from 'openpgp/lightweight';
interface github_gpg_key {
  key_id?: string,
  raw_key?: string,
  emails?: object[]
}

const getEncryKeyFromText: (text: string) => Promise<string> = async (text: string) => {
  if (0 === (text.length ?? 0)) {
    return '';
  }
  const encryptText = await openpgp.readMessage({ armoredMessage: text });
  const keyIds = await encryptText.getEncryptionKeyIDs();
  const keyIdHex = keyIds.map( keyId  => keyId.toHex());
  const idListStr = keyIdHex.join(',');
  return idListStr;
}

const getKeyCanEncryptAndNotRevoked: (keys: any) => github_gpg_key = (keys: any) => {
  if (0 === (keys.length ?? 0)) {
    return {};
  }
  for (const key of keys) {
    if (key["revoked"] === true) {
      continue;
    }
    else if (key["can_encrypt_comms"] === true || key["can_encrypt_storage"] === true) {
      return {
        "key_id": key["key_id"],
        "raw_key": key["raw_key"],
        "emails": key["emails"],
      };
    }
    const subkeys: object[] = key["subkeys"];
    for (const subkey of subkeys) {
      const value = getKeyCanEncryptAndNotRevoked([subkey,]);
      if (Object.keys(value).length !== 0 && (value.raw_key ?? '' === '')) {
        console.log(`find subkey ${value.key_id} match`)
        console.log('return main key')
        return {
          "key_id": key["key_id"],
          "raw_key": key["raw_key"],
          "emails": key["emails"],
        };
      }
    }
  }

  // if type of key is array,then do something
  return {};
};

export type { github_gpg_key };
export { getKeyCanEncryptAndNotRevoked,getEncryKeyFromText };
