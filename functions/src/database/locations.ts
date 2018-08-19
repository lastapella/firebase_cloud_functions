import { database } from '../firebaseAdmin';

export const getLocation = (locationKey: string) => {
	return database()
		.ref(`locations/${locationKey}`)
		.once('value')
		.then(snapshot => snapshot.val());
};
