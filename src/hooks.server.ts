export const handleError = ({ error, event }) => {
  console.error('Unhandled error:', JSON.stringify(error, null, 2));
  return {
    message: (error as Error)?.message ?? 'Unknown error',
    stack: (error as Error)?.stack,
  };
};