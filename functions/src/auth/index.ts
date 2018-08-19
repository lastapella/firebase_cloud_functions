import { auth } from '../firebaseAdmin';
import * as _ from 'lodash';

export const addAuthUser = data => {
	// Reject falsey values
	const dataWithoutFalseyValues = _.pickBy(data, _.identity);
	return auth().createUser(dataWithoutFalseyValues);
};

export const updateAuthUser = (uid, data) => {
	const dataWithoutFalseyValues = _.pickBy(data, _.identity);
	return auth().updateUser(uid, dataWithoutFalseyValues);
};

export const deleteAuthUser = uid => {
	return auth().deleteUser(uid);
};
