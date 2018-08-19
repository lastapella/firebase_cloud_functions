import { database } from '../firebaseAdmin';
import * as _ from 'lodash';

// Removed means that this number has to be overwrite in HW db
export const removeVehicleFromGateList = (vehicleKey, gatekey) => {
	return database()
		.ref(`vehicles_per_gate/${gatekey}/vehicles_list/${vehicleKey}/removed`)
		.set(true)
		.then(() => 'REMOVED');
};

export const getGatesPerDriver = driverKey => {
	return database()
		.ref(`drivers/${driverKey}/gates`)
		.once('value')
		.then(dataSnapshot => {
			const driverLocationGateList = dataSnapshot.val();
			const driverGateList = Object.keys(driverLocationGateList).reduce(
				(list, locationKey) => ({
					...list,
					...driverLocationGateList[locationKey]
				}),
				{}
			);
			return Promise.all(
				Object.keys(driverGateList).map(gateKey => {
					return database()
						.ref(`gates`)
						.once('value')
						.then(snapshot => {
							const locationGateList = snapshot.val();
							const gateList = Object.keys(locationGateList).reduce(
								(list, locationKey) => ({
									...list,
									...locationGateList[locationKey]
								}),
								{}
							);

							return gateList[gateKey] && driverGateList[gateKey]
								? gateKey
								: null;
						});
				})
			).then(values => {
				return values.filter(value => !!value);
			});
		})
		.catch(err => {
			console.log(err);
			return Promise.resolve([]);
		});
};

export const getGatesPerDriverList = driverKeyList => {
	return Promise.all(
		driverKeyList.map(driverKey => {
			return getGatesPerDriver(driverKey);
		})
	).then((ListOfListOfGate: any[]) => {
		return _.uniq(_.flatten(ListOfListOfGate));
	});
};

export const getGatesPerVehicle = vehicleKey => {
	return database()
		.ref(`vehicles/${vehicleKey}/drivers`)
		.once('value')
		.then(dataSnapshot => {
			const driversKeys = dataSnapshot.val();
			return getGatesPerDriverList(driversKeys);
		});
};

const getVehiclesPerGate = gateKey => {
	return database()
		.ref(`vehicles_per_gates/${gateKey}/vehicles_list`)
		.once('value')
		.then(snapshot => snapshot.val());
};

export const appendVehicleToVehicleGateList = (
	vehicleKey,
	gateKey,
	sendToHardware: boolean = false,
	location: number = -1,
	removed: boolean = false
) => {
	return database()
		.ref(`vehicles_per_gate/${gateKey}/vehicles_list/${vehicleKey}`)
		.set({
			sendToHardware: sendToHardware,
			location: location,
			removed: removed
		})
		.then(() => {
			return database()
				.ref(`vehicles_per_gate/${gateKey}/length`)
				.once('value')
				.then(lengthSnapshot => {
					const currentLength = lengthSnapshot.val() || 0;
					const length =
						sendToHardware && !removed ? currentLength + 1 : currentLength;
					return database()
						.ref(`vehicles_per_gate/${gateKey}/length`)
						.set(length);
				});
		})
		.then(() => 'VEHICLE_ADDED_TO_LIST');
};

export const addVehicleToGatesLists = (vehicleKey: string) => {
	return getGatesPerVehicle(vehicleKey).then(listOfGate => {
		return Promise.all(
			listOfGate.map(gateKey => {
				appendVehicleToVehicleGateList(vehicleKey, gateKey);
			})
		);
	});
};

export const getAllVehiclesPerGateLists = () => {
	return database()
		.ref('vehicles_per_gate')
		.once('value')
		.then(snapshots => {
			const res: any[] = [];
			snapshots.forEach(snapshot => {
				res.push(snapshot.key);
				return false; // Prevent to stop the foreach
			});
			return res;
		});
};

export const getGateVehicleListLength = (gateKey: string) => {
	return database()
		.ref(`vehicles_per_gate/${gateKey}/length`)
		.once('value')
		.then(snapshot => snapshot.val());
};

export const getVehicleLocationInVehicleGateList = (
	vehicleKey: string,
	gateKey: string
) => {
	return database()
		.ref(`vehicles_per_gate/${gateKey}/vehicles_list/${vehicleKey}/location`)
		.once('value')
		.then(snapshot => snapshot.val());
};

export const getGate = (locationKey: string, gateKey: string) => {
	return database()
		.ref(`gates/${locationKey}/${gateKey}`)
		.once('value')
		.then(snapshot => snapshot.val());
};

export const updateGate = (locationKey: string, gateKey: string, data: any) => {
	return database()
		.ref(`gates/${locationKey}/${gateKey}`)
		.update(data);
};
