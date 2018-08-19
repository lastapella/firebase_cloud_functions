import { database } from '../firebaseAdmin';

export const getVehiclesFromDriver = driverKey => {
	return database()
		.ref(`drivers/${driverKey}/vehicles`)
		.once('value')
		.then(vehicleListObjectSnapshot => {
			const res: any[] = [];
			vehicleListObjectSnapshot.forEach(snapshot => {
				res.push(snapshot.val());
				return false; // Prevent cancel foreach
			});
			return res;
		});
};
