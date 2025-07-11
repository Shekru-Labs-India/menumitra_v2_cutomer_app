import QueryErrorBoundary from './QueryErrorBoundary';
import QueryTest from './QueryTest';

function QueryTestWrapper() {
  return (
    <QueryErrorBoundary>
      <QueryTest />
    </QueryErrorBoundary>
  );
}

export default QueryTestWrapper;
