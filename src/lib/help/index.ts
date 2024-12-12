import fcd from '$lib/help/flight_create_data.md?raw';

const lookup = {
  '/flight/create/data': '$lib/help/flight_create_data.md?raw', 
}

export const getHelp2 = async ( pathname: string) => {
  return await import (lookup[pathname]);
}


export const getHelp = (pathname: string) =>{
  switch (pathname) {
    case '/flight/create/data':
      return fcd;
    default:
      console.log('no help for ', pathname);
  }
}
