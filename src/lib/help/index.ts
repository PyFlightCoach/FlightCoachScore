import home from '/help/home.md?raw';
import fcd from '/help/flight_create_data.md?raw';
import fcm from '/help/flight_create_manoeuvres.md?raw';

const lookup = {
	'/flight/create/data': '$lib/help/flight_create_data.md?raw'
};

export const getHelp2 = async (pathname: string) => {
	return await import(lookup[pathname]);
};

export const getHelp = async (pathname: string) => {
	const helpPath = `/help/${pathname.replace('/', '')}.md`;

	return await fetch(helpPath)
		.then((response) => {})
		.catch((error) => console.log('error fetching help', error));

};
