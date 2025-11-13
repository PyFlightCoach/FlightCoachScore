

export function validateEmail(email: string | undefined): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email || "");
}


export function prettyPrintHttpError(err: any): string {
  
  if (err.response && err.response.data && err.response.data.detail && err.response.data.detail.length && err.response.data.detail[0].msg) {
    return err.response.data.detail[0].msg;
  } else {
    return err.response.data.detail || err.message || 'An unknown error occurred.';

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


export function numberToPosition(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = n % 100;
  return n + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}


function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export function prettyDate(date: Date | undefined, includeTime=true): string {

  if (!date) return "-";

  let day: string | undefined = undefined;
  if (isToday(date)) {
    day = "Today";
  } else if (isYesterday(date)) {
    day = "Yesterday";
  } else {
    day = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
  if (includeTime) {
    return `${day} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return day;
  
}

export function noTrailingSlash(path: string) {
  return path.endsWith("/") ? path.slice(0, path.length - 1 ) : path;
}