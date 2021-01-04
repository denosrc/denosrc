export const hasContextAwareHostname = (url: URL): boolean => {
  // TODO: test me
  return url.hostname.indexOf(".") === -1;
};

export const rewriteContextualizedURL = (url: URL): string => {
  // TODO: test me
  const leadingSlashCount = url.pathname.search(/[^\/]/);

  switch (leadingSlashCount) {
    default: {
      return url.href;
    }

    case -1:
    case 0: {
      return "";
    }

    case 2: {
      return url.pathname.search(/^\/\/https?:\/\//) === 0
        ? url.pathname.slice(2) + url.search + url.hash
        : url.href;
    }

    case 1: {
      return "https:/" + url.pathname + url.search + url.hash;
    }
  }
};
