import { getGithubKey } from '@/components/linkes/github';


const fetchKeyByUrl: (prefix: string, path: string) => Promise<string> = async (prefix: string, path: string) => {
  if (prefix === 'github') {
    return await getGithubKey(path);
  } else if (prefix.length === 0) {
    const defaultKey = await fetch('https://blog.certseeds.com/public.key', {
      method: 'get',
    }).then(body => body.text())
    return defaultKey
  } else if (prefix === 'raw') {
    console.log('please ensure the cors rules allow this page')
    if (!path.startsWith('https')) {
      console.log('public key should load by https')
      return '';
    }
    const defaultKey = await fetch(path, {
      method: 'get',
    }).then(body => body.text())
    return defaultKey
  }
  return '';
}

export { fetchKeyByUrl };
