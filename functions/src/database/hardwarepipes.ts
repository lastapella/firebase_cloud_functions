import { database } from '../firebaseAdmin';

export const getGateAndLocationData = (gateKey: string) => {
	return database()
		.ref(`gates`)
		.once('value')
		.then(snapshot => {
			const locationGateList = snapshot.val();
			return Object.keys(locationGateList).reduce((list, locationKey) => {
				console.log(!!locationGateList[locationKey][gateKey]);
				return locationGateList[locationKey][gateKey]
					? {
							...locationGateList[locationKey][gateKey],
							locationKey
					  }
					: list;
			}, {});
		})
		.then(gateData => {
			return gateData.locationKey
				? database()
						.ref(`locations/${gateData.locationKey}`)
						.once('value')
						.then(snapshot => ({
							gate: { ...gateData },
							location: { ...snapshot.val() }
						}))
				: { gate: null, location: null };
		});
};
export const getGateAndLocationDataWithLocationKey = (
	gateKey: string,
	locationKey: string
) => {
	return database()
		.ref(`gates/${locationKey}/${gateKey}`)
		.once('value')
		.then(snapshot => snapshot.val())
		.then(gateData => {
			return database()
				.ref(`locations/${locationKey}`)
				.once('value')
				.then(snapshot => ({
					gate: { ...gateData },
					location: { ...snapshot.val() }
				}));
		});
};
