import { useQuery, UseQueryOptions, QueryKey } from 'react-query';

export function useFetchQuery<T>(
  queryKey: string,
  path: string,
  options: UseQueryOptions<T, unknown, T, QueryKey> = {},
) {
  return useQuery<T>(
    queryKey,
    async () => {
      return fetch(`http://localhost:9000/${path}`).then((res) => res.json());
    },
    options,
  );
}
