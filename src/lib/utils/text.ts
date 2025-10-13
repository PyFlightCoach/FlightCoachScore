

export function validateEmail(email: string | undefined): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email || "");
}


export function prettyPrintHttpError(err: any): string {
  
  if (err.response && err.response.data && err.response.data.detail) {
    return `Error ${err.response.status}: ${err.response.data.detail.detail || err.response.data.detail.msg || err.response.data.detail}`;
  } else if (err.message) {
    return `Error: ${err.message}`;
  } else {
    return 'An unknown error occurred.';
  }
} 


export function isValidVersion(version: string) {
  try {
    version.split(".").map(parseInt);
    return true
  } catch {
    return false
  }
  
}

export function compareUUIDs (a: string| undefined, b: string | undefined) {
  return (a || b) ? a?.replaceAll('-', '') === b?.replaceAll('-', '') : false
}

export function includesUUID (list: string[], uuid: string | undefined) {
  return uuid !==undefined && list.some((x) => compareUUIDs(x, uuid));
}