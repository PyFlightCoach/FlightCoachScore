


export async function load({ url }) {
	const element = url.searchParams.get('element');
  const dg = url.searchParams.get('dg');

  return {element, dg}
}