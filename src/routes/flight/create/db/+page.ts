import {loadAnalysisFromDB} from '$lib/flight/analysis';

export function load({url}) {
  //load the holding id from query parameters
  const id = url.searchParams.get('id');
  
  loadAnalysisFromDB(id!);

}