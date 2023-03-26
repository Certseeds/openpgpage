import { getGithubKey } from '@/components/linkes/github';


const fetchKeyByUrl: (prefix: string, path: string) => Promise<string> = async (prefix: string, path: string) => {
  if (prefix === 'github') {
    return await getGithubKey(path);
  } else if (prefix.length === 0) {
    const defaultKey = await fetch('https://certseeds.github.io/Certseeds/public.key', {
      method: 'get',
    }).then(body => body.text())
    return defaultKey
  }
  return '';
}

export { fetchKeyByUrl };
