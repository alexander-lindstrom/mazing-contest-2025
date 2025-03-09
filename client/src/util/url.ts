
export function getParamFromUrl(paramName: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
  }
  
 export function removeParamFromUrl(paramName: string) {
    const url = new URL(window.location.href);
    url.searchParams.delete(paramName);
    window.history.replaceState(null, '', url.toString());
  }