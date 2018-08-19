import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { database, auth } from '../firebaseAdmin';
import {
	isAdmin,
	addDatabaseAdministrator,
	updateDatabaseAdministrator,
	deleteDatabaseAdministrator
} from '../database';
import { addAuthUser, updateAuthUser, deleteAuthUser } from '../auth';
import {
	USER_NOT_ALLOWED,
	LIST_USER_MAX_RESULTS,
	DEFAULT_MESSAGE_ERROR,
	DATA_REQUIRED
} from '../constant';

const normalizeSnapshot = (snapshot: admin.database.DataSnapshot) => {
	const result: any[] = [];
	snapshot.forEach(childSnapshot => {
		result.push({ key: childSnapshot.key, ...childSnapshot.val() });
		return false; // return true cancel any further enumeration
	});
	return result;
};

export const administrators_add = functions.https.onCall((data, context) => {
	return isAdmin(context.auth ? context.auth.uid : '', 'SUPER_ADMIN').then(
		res => {
			if (res) {
				return addAuthUser(data)
					.then(userRecord => {
						return addDatabaseAdministrator(userRecord.uid, data);
					})
					.catch(err => err);
			} else {
				return { error: { path: 'auth', message: USER_NOT_ALLOWED } };
			}
		}
	);
});

export const administrors_update = functions.https.onCall((data, context) => {
	return context.auth
		? isAdmin(context.auth.uid, 'SUPER_ADMIN').then(res => {
				if (res) {
					return updateAuthUser(data.uid, data)
						.then(userRecord =>
							database()
								.ref('administrators/' + userRecord.uid)
								.once('value')
								.then(() => updateDatabaseAdministrator(userRecord.uid, data))
								.catch(() => addDatabaseAdministrator(userRecord.uid, data))
						)
						.catch(err => err);
				} else {
					return { error: { path: 'auth', message: USER_NOT_ALLOWED } };
				}
		  })
		: { error: { path: 'auth', message: USER_NOT_ALLOWED } };
});

export const administrators_delete = functions.https.onCall((data, context) => {
	return isAdmin(context.auth ? context.auth.uid : '', 'SUPER_ADMIN').then(
		(res) : Promise<any> => {
			return res
				? deleteAuthUser(data.uid).then(() =>
						deleteDatabaseAdministrator(data.uid).then(() => ({
							res: `Administrator ${data.uid} successfully deleted`
						}))
				  )
				: Promise.resolve({
						error: { path: 'auth', message: USER_NOT_ALLOWED }
				  });
		}
	);
});

export const administrators_get = functions.https.onCall((data, context) => {
	return context.auth
		? isAdmin(context.auth.uid).then(res => {
				if (res) {
					return data.uid
						? database()
								.ref('administrators/' + data.uid)
								.once('value')
								.then(dbAdminValue => {
									return auth()
										.getUser(data.uid)
										.then(authAdminValue => {
											return {
												key: dbAdminValue.key,
												...dbAdminValue.val(),
												...authAdminValue
											};
										});
								})
						: DATA_REQUIRED;
				} else {
					return { error: { path: 'auth', message: USER_NOT_ALLOWED } };
				}
		  })
		: { error: { path: 'auth', message: USER_NOT_ALLOWED } };
});

export const administrators_getAll = functions.https.onCall((data, context) => {
	return context.auth
		? isAdmin(context.auth.uid).then(res => {
				console.log(res);
				return res
					? database()
							.ref('administrators/')
							.once('value')
							.then(dbAdminListSnapshot => {
								const dbAdminListValues = normalizeSnapshot(
									dbAdminListSnapshot
								);
								return Promise.all(
									dbAdminListValues.map(dbAdminValue => {
										return auth()
											.getUser(dbAdminValue.key)
											.then(authAdminValue => {
												return {
													...dbAdminValue,
													...authAdminValue
												};
											})
											.catch(err => {
												return {
													error: 'AUTH_USER_NOT_FOUND',
													userId: dbAdminValue.key
												};
											});
									})
								).then(values => {
									return values;
								});
							})
							.catch(() => ({
								error: { path: 'auth', message: DEFAULT_MESSAGE_ERROR }
							}))
					: { error: { path: 'auth', message: USER_NOT_ALLOWED } };
		  })
		: { error: { path: 'auth', message: USER_NOT_ALLOWED } };
});

export const administrators_listUser = functions.https.onCall((data, context) => {
	return isAdmin(context.auth ? context.auth.uid : '').then(res => {
		res
			? auth()
					.listUsers(
						data.maxResult ? data.maxResult : LIST_USER_MAX_RESULTS,
						data.pageToken ? data.pageToken : null
					)
					.catch(() => DEFAULT_MESSAGE_ERROR)
			: { error: { path: 'auth', message: USER_NOT_ALLOWED } };
	});
});
