import { goto } from '$app/navigation';
import { base } from '$app/paths';



export async function load({ url }) {
	const element = url.searchParams.get('element');
  const dg = url.searchParams.get('dg');
  if (!element || !dg) {
    goto(`${base}/flight/results/manoeuvre/intra/`);
  }
  return {element:element!, dg: dg!}
}