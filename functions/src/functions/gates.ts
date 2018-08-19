import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// import { database, auth } from '../firebaseAdmin';
import {
	addVehicleToGatesLists,
	// addVehicleToVehicleGateList,
	getGatesPerDriverList,
	removeVehicleFromGateList,
	appendVehicleToVehicleGateList,
	getGatesPerVehicle,
	getAllVehiclesPerGateLists,
	getVehiclesFromDriver
} from '../database';
import { object } from 'firebase-functions/lib/providers/storage';
import { DataSnapshot } from '../../node_modules/firebase-functions/lib/providers/database';

// export const removeVehicleFromList =
export const gates_onVehicleDriverListCreate = functions.database
	.ref('vehicles/{vehicleId}/drivers')
	.onCreate((snapshot, event) => {
		const vehicleKey = event.params.vehicleId;
		return addVehicleToGatesLists(vehicleKey);
	});

export const gates_onVehicleDriverListUpdate = functions.database
	.ref('vehicles/{vehicleId}/drivers')
	.onUpdate(({ before, after }, event) => {
		const vehicleKey = event.params.vehicleId;
		const driversAdded = after.val();
		const driversDeleted = before
			.val()
			.filter(key => !after.val().includes(key));
		return getGatesPerDriverList(driversDeleted).then(
			listOfGateToRemoveFrom => {
				return Promise.all(
					listOfGateToRemoveFrom.map(gateKey =>
						removeVehicleFromGateList(vehicleKey, gateKey)
					)
				).then(() => {
					return getGatesPerDriverList(driversAdded).then(listOfGateToAddTo => {
						return Promise.all(
							listOfGateToAddTo.map(gateKey =>
								appendVehicleToVehicleGateList(vehicleKey, gateKey)
							)
						);
					});
				});
			}
		);
	});

export const gates_onVehicleDriverListDelete = functions.database
	.ref('vehicles/{vehicleId}/drivers')
	.onDelete((snapshot, event) => {
		const vehicleKey = event.params.vehicleId;
		const driversDeleted = snapshot.val();
		return getAllVehiclesPerGateLists().then(gates => {
			return Promise.all(
				gates.map(gateKey => removeVehicleFromGateList(vehicleKey, gateKey))
			);
		});
	});

// export const gates_onGateDelete = functions.database
// 	.ref('gates/{locationId}')
// 	.onDelete((snapshot, event) => {

// 	});

export const gates_onDriverGateUpdate = functions.database
	.ref('drivers/{driverId}/gates/{locationId}')
	.onUpdate(({ before, after }, event) => {
		const driverKey = event.params.driverId;
		const gatesBefore = before.val();
		console.log('GATES BEFORE', gatesBefore);
		return getVehiclesFromDriver(driverKey).then(vehicleKeysList => {
			return Promise.all(
				vehicleKeysList.map(vehicleKey => {
					return getGatesPerVehicle(vehicleKey).then(listOfGateOfVehicle => {
						const listOfGateToRemoveFrom = Object.keys(gatesBefore).filter(
							gateKey =>
								!listOfGateOfVehicle.includes(gateKey) && gatesBefore[gateKey]
						);
						const listOfGateToAddTo = listOfGateOfVehicle.filter(
							gateKey =>
								!Object.keys(gatesBefore).includes(gateKey) ||
								!gatesBefore[gateKey]
						);

						console.log('GATES TO ADD', listOfGateToAddTo);
						console.log('GATES TO REMOVE ', listOfGateToRemoveFrom);
						return Promise.all([
							...listOfGateToRemoveFrom.map(gateKey =>
								removeVehicleFromGateList(vehicleKey, gateKey)
							),
							...listOfGateToAddTo.map(gateKey =>
								appendVehicleToVehicleGateList(vehicleKey, gateKey)
							)
						]);
					});
				})
			);
		});
	});
