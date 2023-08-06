interface keybase_io_key {
  key_id?: string,
  raw_key?: string,
}

const getKeybaseKey: (username: string) => Promise<string> = async (username: string) => {
  if ((username?.length ?? 0) > 0) {
    const url = `https://keybase.io/_/api/1.0/user/lookup.json?username=${username}&fields=public_keys`
    const ownKey = await fetch(url, {
      method: 'get',
      headers: { 'Accept': 'application/json', },
    }).then(body => body.json())
      .then(json => {
        const value = getBundleKey(json);
        return value.raw_key
      }) ?? '';
    return ownKey;
  }
  return '';
}

const getBundleKey: (keys: any) => keybase_io_key = (keys: any) => {
  // keys is a {}, not []
  if (0 === (Object.keys(keys).length ?? 0)) {
    return {};
  } else if (keys["status"]["code"] !== 0 || keys["status"]["name"] !== "OK") {
    console.log("keybase.io api error");
    return {};
  }
  const primary = keys["them"]["public_keys"]["primary"];
  console.log(`mtime: ${primary["mtime"]}, ctime: ${primary["ctime"]}, etime: ${primary["etime"]}`);// TODO, what is those means?
  return {
    key_id: primary["kid"],
    raw_key: primary["bundle"],

  }
};

export type { keybase_io_key };
export { getKeybaseKey, getBundleKey };
