import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query/queryKeys';

function QueryTest() {
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: queryKeys.categories('test-outlet'),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return ['Category 1', 'Category 2', 'Category 3'];
    },
  });

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">TanStack Query Test</h3>
          
          <div className="mb-3">
            <span className={`badge ${isLoading ? 'bg-warning' : 'bg-success'} me-2`}>
              {isLoading ? 'Loading...' : 'Ready'}
            </span>
            {isFetching && !isLoading && (
              <span className="badge bg-info">Background Refreshing...</span>
            )}
          </div>

          {error && (
            <div className="alert alert-danger">
              Error: {error.message}
            </div>
          )}

          {data && (
            <div>
              <h5>Query Results:</h5>
              <pre className="bg-light p-3 rounded">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueryTest;
