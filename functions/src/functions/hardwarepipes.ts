import * as functions from 'firebase-functions';
import {
	getGateVehicleListLength,
	appendVehicleToVehicleGateList,
	getVehicleLocationInVehicleGateList,
	getGateAndLocationData,
	getGateAndLocationDataWithLocationKey,
	isAdmin,
	getGate,
	getLocation,
	updateGate
} from '../database';
import { writeIU, setLCDMessage, getLCDMessage } from '../http_call';
import { USER_NOT_ALLOWED } from '../constant';
import { getDummyLCDMessage } from '../http_call/mockFunctions';

const DUMMY_IUNUMBER = '0000000000';

export const hardwarepipe_onGateVehiclesListRecordCreate = functions.database
	.ref('vehicles_per_gate/{gateKey}/vehicles_list/{vehicleKey}')
	.onCreate((snapshot, event) => {
		const iunumber = event.params.vehicleKey;
		const gateKey = event.params.gateKey;
		return getGateAndLocationData(gateKey).then(gateAndLocationData => {
			return getGateVehicleListLength(gateKey).then(length => {
				if (
					gateAndLocationData.location.url &&
					gateAndLocationData.gate.portNum &&
					length
				) {
					return writeIU(
						gateAndLocationData.location.url,
						gateAndLocationData.gate.portNum,
						length,
						iunumber
					).then(() =>
						appendVehicleToVehicleGateList(iunumber, gateKey, true, length)
					);
				} else {
					throw Error('Some data are missing to send connect to hardware');
				}
			});
		});
	});

export const hardwarepipe_onGateVehiclesListRecordRemoved = functions.database
	.ref('vehicles_per_gate/{gateKey}/vehicles_list/{vehicleKey}/removed')
	.onUpdate(({ before, after }, event) => {
		const iunumber = event.params.vehicleKey;
		const gateKey = event.params.gateKey;
		return getGateAndLocationData(gateKey).then(gateAndLocationData => {
			return getVehicleLocationInVehicleGateList(iunumber, gateKey).then(
				listLocation => {
					if (
						gateAndLocationData.location.url &&
						gateAndLocationData.gate.portNum &&
						listLocation
					) {
						return writeIU(
							gateAndLocationData.location.url,
							gateAndLocationData.gate.portNum,
							listLocation,
							DUMMY_IUNUMBER
						).then(() =>
							appendVehicleToVehicleGateList(
								iunumber,
								gateKey,
								true,
								listLocation,
								true
							)
						);
					} else {
						throw Error('Some data are missing to send connect to hardware');
					}
				}
			);
		});
	});

export const harwarepipe_onGateMessageCreate = functions.database
	.ref('gates/{locationKey}/{gateKey}/message')
	.onCreate((snapshot, event) => {
		const { gateKey, locationKey } = event.params;
		const message = snapshot.val();
		return getGateAndLocationDataWithLocationKey(gateKey, locationKey).then(
			gateAndLocationData => {
				setLCDMessage(
					gateAndLocationData.location.url,
					gateAndLocationData.gate.portNum,
					message
				);
			}
		);
	});

export const hardwarepipe_onGateMessageUpdate = functions.database
	.ref('gates/{locationKey}/{gateKey}/message')
	.onUpdate(({ before, after }, event) => {
		const { gateKey, locationKey } = event.params;
		const message = after.val();
		return getGateAndLocationDataWithLocationKey(gateKey, locationKey).then(
			gateAndLocationData => {
				setLCDMessage(
					gateAndLocationData.location.url,
					gateAndLocationData.gate.portNum,
					message
				);
			}
		);
	});

export const harwarepipe_onGateMessageDelete = functions.database
	.ref('gates/{locationKey}/{gateKey}/message')
	.onDelete((snapshot, event) => {
		const { gateKey, locationKey } = event.params;
		const message = '';
		return getGateAndLocationDataWithLocationKey(gateKey, locationKey).then(
			gateAndLocationData => {
				setLCDMessage(
					gateAndLocationData.location.url,
					gateAndLocationData.gate.portNum,
					message
				);
			}
		);
	});

export const hardwarepipe_setLCDMessageFromHardware = functions.https.onCall(
	(data, context) => {
		return context.auth
			? isAdmin(context.auth.uid, 'SUPER_ADMIN').then(res => {
					const { locationKey, gateKey } = data;
					return Promise.all([
						getLocation(locationKey),
						getGate(locationKey, gateKey)
					]).then(values => {
						const location = values[0];
						const gate = values[1];
						// return getLCDMessage(location.url, gate.portNum);
						return getDummyLCDMessage(location.url, gate.portNum).then(
							message => updateGate(locationKey, gateKey, { message })
						);
					});
			  })
			: { error: { path: 'auth', message: USER_NOT_ALLOWED } };
	}
);
