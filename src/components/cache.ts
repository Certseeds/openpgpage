import { openDB, deleteDB, wrap, unwrap } from 'idb';
import { fetchKeyByUrl } from '@/components/linktokey';
interface pathToGpgKeys {
  path: string;
  rawKey: string;
  createTime: number;
  lastUpdate: number;
}
const common = {
  name: "openpgpdb",
  version: 1,
  tableName: 'path_to_gpg_keys',
  updateMills: 24 * 60 * 60 * 1000,
}
const getIndexDB = async () => {
  const db = await openDB(common.name, common.version, {
    upgrade(db2, oldVersion, newVersion, transaction, event) {
      console.log('oldVersion: %d, newVersion: %d', oldVersion, newVersion);
      if (!db2.objectStoreNames.contains(common.tableName)) {
        const objectStorage = db2.createObjectStore(common.tableName, { keyPath: 'path' })
        objectStorage.createIndex('path', 'path', { unique: true })
        //objectStorage.createIndex('id', 'id', { unique: false }) // TODO
        objectStorage.createIndex('rawKey', 'rawKey', { unique: false })
        objectStorage.createIndex('createTime', 'createTime', { unique: false })
        objectStorage.createIndex('lastUpdate', 'lastUpdate', { unique: false })
        return objectStorage;
      }
    },
    blocked(currentVersion, blockedVersion, event) {
      console.log('not now');
    },
    blocking(currentVersion, blockedVersion, event) {
      console.log('not now');
    },
    terminated() {
      console.log('idb connnection terminuated')
    },
  });
  return db;
  // const request = window.indexedDB.open(common.name, common.version);
  // request.onerror = (event) => {
  //   alert("IndexDB not detect or allowed, load fail");
  // };
  // request.onsuccess = (event) => {
  //   const db = (event.target as IDBOpenDBRequest)?.result;
  //   console.log(db)
  // };
  // request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
  //   const db = (event.target as IDBOpenDBRequest)?.result;
  // }
}

const getOrFetch: (path: string) => Promise<pathToGpgKeys> = async (path: string) => {
  const database = await getIndexDB();
  const value: pathToGpgKeys = await database.get(common.tableName, path);
  const now = (new Date()).getTime()
  if (value !== null && value !== undefined) {
    if (now - value.lastUpdate <= common.updateMills) {
      return value;
    }
  }
  // now value is null| undefined or can use but need update
  const key = await fetchKeyByUrl(path);
  if (key === null || key === undefined) {
    throw new Error('fetch key fail');
  }

  const createTimeOfObject = value?.createTime ?? now;
  const obj: pathToGpgKeys = {
    path: path,
    rawKey: key,
    createTime: createTimeOfObject,
    lastUpdate: now,
  };
  await database.put(common.tableName, obj);
  return obj;
}


export { getOrFetch };
