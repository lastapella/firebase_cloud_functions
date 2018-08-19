import { database } from '../firebaseAdmin';
import * as _ from 'lodash';
import { DEFAULT_ROLE } from '../constant';

export const addDatabaseAdministrator = (key, data) => {
	const dataToAdd =
		data.role
			? _.pick(data, 'role')
			: { role: {[DEFAULT_ROLE]: true} };
	return database()
		.ref('administrators/' + key)
		.set(dataToAdd)
		.then(() => key);
};
export const updateDatabaseAdministrator = (key, data) => {
	const dataToEdit =
		data.role 
			? _.pick(data, 'role')
			: { role: {[DEFAULT_ROLE]: true} };
	return database()
		.ref('administrators/' + key)
		.update(dataToEdit)
		.then(() => key);
};
export const deleteDatabaseAdministrator = key => {
	return database()
		.ref('administrators/' + key)
		.remove();
};

export const isAdmin = (uid: string, role?: string) : Promise<boolean> => {
	return database()
		.ref('administrators/' + uid)
		.once('value')
		.then(administrator => {
			return role
				? !!administrator
						.child(`role/${role}`)
						.val()
				: !!administrator;
		})
};
