

export function validateEmail(email: string | undefined): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email || "");
}


export function prettyPrintHttpError(err: any): string {
  if (err.response && err.response.data && err.response.data.detail) {
    return `Error ${err.response.status}: ${err.response.data.detail}`;
  } else if (err.message) {
    return `Error: ${err.message}`;
  } else {
    return 'An unknown error occurred.';
  }
} 