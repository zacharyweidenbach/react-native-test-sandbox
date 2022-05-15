import { useQuery, UseQueryOptions, QueryKey } from 'react-query';

export function useFetchQuery<T>(
  queryKey: string,
  path: string,
  options: UseQueryOptions<T, unknown, T, QueryKey> = {},
) {
  return useQuery<T>(
    queryKey,
    async () => {
      const rawResponse = await fetch(`http://localhost:9000/${path}`);
      const json = await rawResponse.json();
      if (!rawResponse.ok) {
        throw Error(json?.error?.message || 'Something went wrong');
      }

      return json;
    },
    options,
  );
}
