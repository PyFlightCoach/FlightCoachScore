

export function validateEmail(email: string | undefined): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email || "");
}
