import { analysisServer } from '$lib/api';

export async function load() {
  const rules = (await analysisServer.get("rules")).data;
  return {rules};
}