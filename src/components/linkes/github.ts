interface github_gpg_key {
  key_id?: string,
  raw_key?: string,
  emails?: object[]
}

const getGithubKey: (username: string) => Promise<string> = async (username: string) => {
  if ((username?.length ?? 0) > 0) {
    const url = `https://api.github.com/users/${username}/gpg_keys`
    const ownKey = await fetch(url, {
      method: 'get',
      headers: { 'Accept': 'application/vnd.github+json', },
    }).then(body => body.json())
      .then(bodyJson => {
        const value = getKeyCanEncryptAndNotRevoked(bodyJson);
        return value.raw_key
      }) ?? '';
    return ownKey;
  }
  return '';
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
export { getGithubKey, getKeyCanEncryptAndNotRevoked };
