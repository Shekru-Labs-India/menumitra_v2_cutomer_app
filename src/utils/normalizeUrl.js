const normalizeUrl = (baseUrl, path) => {
  const combinedUrl = `${baseUrl}/${path}`;
  return combinedUrl.replace(/([^:]\/)\/+/g, "$1");
};

export { normalizeUrl };
