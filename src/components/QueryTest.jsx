import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query/queryKeys';

function QueryTest() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.categories('test-outlet'),
    queryFn: () => Promise.resolve(['test category']),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Test Query Result:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default QueryTest;
