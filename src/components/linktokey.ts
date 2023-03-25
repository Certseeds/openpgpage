import { getGithubKey } from '@/components/linkes/github';

const fetchKeyByUrl: (input: string) => Promise<string> = async (path: string) => {
  if (path.startsWith("github")) {
    const username = path.split("/")[1];// i guess github do not allow '/' in username
    return getGithubKey(username);
  }
  return await fetch('https://certseeds.github.io/Certseeds/public.key', {
    method: 'get',
  }).then(body => body.text());
}

export { fetchKeyByUrl };
