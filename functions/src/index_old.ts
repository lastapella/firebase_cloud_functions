import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import {
	USER_NOT_ALLOWED,
	DEFAULT_ROLE,
	LIST_USER_MAX_RESULTS,
	DEFAULT_MESSAGE_ERROR,
	DATA_REQUIRED
} from './constant';

admin.initializeApp(functions.config().firebase);

const { database, auth } = admin;

const normalizeSnapshot = (snapshot: admin.database.DataSnapshot) => {
	const result: any[] = [];
	snapshot.forEach(childSnapshot => {
		result.push({ key: childSnapshot.key, ...childSnapshot.val() });
		return false; // return true cancel any further enumeration
	});
	return result;
};

const addAuthUser = data => {
	// Reject falsey values
	const dataWithoutFalseyValues = _.pickBy(data, _.identity);
	return auth().createUser(dataWithoutFalseyValues);
};

const updateAuthUser = (uid, data) => {
	const dataWithoutFalseyValues = _.pickBy(data, _.identity);
	return auth().updateUser(uid, dataWithoutFalseyValues);
};

const deleteAuthUser = uid => {
	return auth().deleteUser(uid);
};

const addDatabaseAdministrator = (key, data) => {
	const dataToAdd =
		data.role && data.role.length > 0
			? _.pick(data, 'role')
			: { role: DEFAULT_ROLE };
	return database()
		.ref('administrators/' + key)
		.set(dataToAdd)
		.then(() => key);
};
const updateDatabaseAdministrator = (key, data) => {
	const dataToEdit =
		data.role && data.role.length > 0
			? _.pick(data, 'role')
			: { role: DEFAULT_ROLE };
	return database()
		.ref('administrators/' + key)
		.update(dataToEdit)
		.then(() => key);
};
const deleteDatabaseAdministrator = key => {
	return database()
		.ref('administrators/' + key)
		.remove();
};

const isAdmin = (uid: string, role?: string) => {
	return database()
		.ref('administrators/' + uid)
		.once('value')
		.then(administrator => {
			return role
				? administrator
						.child('role')
						.val()
						.includes(role)
				: !!administrator;
		})
		.catch(reason => {
			return false;
		});
};

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
// 	response.send('Hello from onRequest Firebase!');
// });

// export const helloWorld2 = functions.https.onCall((params, context) => {
// 	return testDB().then(snapshot => {
// 		return normalizeSnapshot(snapshot);
// 	});
// });

export const addAdmin = functions.https.onCall((data, context) => {
	return isAdmin(context.auth ? context.auth.uid : '', 'SUPER_ADMIN').then(
		res => {
			if (res) {
				return addAuthUser(data)
					.then(userRecord => {
						return addDatabaseAdministrator(userRecord.uid, data);
					})
					.catch(err => err);
			} else {
				return USER_NOT_ALLOWED;
			}
		}
	);
});

export const updateAdmin = functions.https.onCall((data, context) => {
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
					return USER_NOT_ALLOWED;
				}
		  })
		: USER_NOT_ALLOWED;
});

export const deleteAdmin = functions.https.onCall((data, context) => {
	return isAdmin(context.auth ? context.auth.uid : '', 'SUPER_ADMIN').then(
		res => {
			if (res) {
				return deleteAuthUser(data.uid).then(() =>
					deleteDatabaseAdministrator(data.uid).then(
						() => `Administrator ${data.uid} successfully deleted`
					)
				);
			} else {
				return USER_NOT_ALLOWED;
			}
		}
	);
});

export const getAdmin = functions.https.onCall((data, context) => {
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
					return USER_NOT_ALLOWED;
				}
		  })
		: USER_NOT_ALLOWED;
});

export const getAllAdmins = functions.https.onCall((data, context) => {
	return context.auth
		? isAdmin(context.auth.uid).then(res => {
				if (res) {
					return database()
						.ref('administrators/')
						.once('value')
						.then(dbAdminListSnapshot => {
							const dbAdminListValues = normalizeSnapshot(dbAdminListSnapshot);
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
						.catch(() => DEFAULT_MESSAGE_ERROR);
				} else {
					return USER_NOT_ALLOWED;
				}
		  })
		: USER_NOT_ALLOWED;
});

export const listFirebaseUsers = functions.https.onCall((data, context) => {
	return isAdmin(context.auth ? context.auth.uid : '').then(res => {
		if (res) {
			return auth()
				.listUsers(
					data.maxResult ? data.maxResult : LIST_USER_MAX_RESULTS,
					data.pageToken ? data.pageToken : null
				)
				.catch(() => DEFAULT_MESSAGE_ERROR);
		} else {
			return USER_NOT_ALLOWED;
		}
	});
});
