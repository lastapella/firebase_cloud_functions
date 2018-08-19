import * as request from 'request-promise';

// const baseURL = 'http://43c70cec.ngrok.io';

const DATATYPE_LCD = 'LCD';
const DATATYPE_IU = 'IU';
const DATATYPE_RTC = 'RTC';

const formatLCDMessage = (message: string) =>
	message.substr(0, 20).padEnd(20, ' ');

// POST
// http://localhost:3330/controller/1
// {
//   "datatype": "IU",
//   "data": "0000000000",
//   "location": 2
// }
export const writeIU = (
	baseURL: string,
	controllerNum: number,
	location: string,
	iuNumber: string
) => {
	const datatype = DATATYPE_IU;
	return request
		.post({
			url: `${baseURL}/controller/${controllerNum}?datatype=${datatype}&location=${location}`,
			headers: {
				'content-type': 'application/json'
			},
			body: {
				datatype: datatype,
				data: iuNumber,
				location: location
			},
			json: true
		})
		.then(response => {
			console.log('WRITEIU RESPONSE', response);
		})
		.catch(err => {
			console.log('WRITEIU TODO HANDLE ERR', err.message);
			throw err;
		});
};

// GET
// http://localhost:3330/controller/1?datatype=IU
export const getAllIU = (baseURL: string, controllerNum: number) => {
	const datatype = DATATYPE_IU;
	return request
		.get({
			url: `${baseURL}/controller/${controllerNum}?datatype=${datatype}`,
			headers: {
				'content-type': 'application/json'
			},
			json: true
		})
		.then(response => {
			console.log('GETALLIU RESPONSE', response);
		})
		.catch(err => {
			console.log('GETALLIU TODO HANDLE ERR', err.message);
			throw err;
		});
};

// GET
// http://localhost:3330/controller/1?datatype=IU
export const getAnIU = (
	baseURL: string,
	controllerNum: number,
	location: string
) => {
	const datatype = DATATYPE_IU;
	return request
		.get({
			url: `${baseURL}/controller/${controllerNum}?datatype=${datatype}&location=${location}`,
			headers: {
				'content-type': 'application/json'
			},
			json: true
		})
		.then(response => {
			console.log('GETALLIU RESPONSE', response);
		})
		.catch(err => {
			console.log('GETALLIU TODO HANDLE ERR', err.message);
			throw err;
		});
};

// GET
// http://localhost:3330/controller/1?datatype=LCD
export const getLCDMessage = (baseURL: string, controllerNum: number) => {
	const datatype = DATATYPE_LCD;
	return request
		.get({
			url: `${baseURL}/controller/${controllerNum}?datatype=${datatype}`,
			headers: {
				'content-type': 'application/json'
			},
			json: true
		})
		.then(response => {
			console.log('GETLCDMESSAGE RESPONSE', response);
		})
		.catch(err => {
			console.log('GETLCDMESSAGE TODO HANDLE ERR', err.message);
			throw err;
		});
};

// POST
// http://localhost:3330/controller/1
// {
//   "datatype": "LCD",
//   "data": "CWB Carpark Entry  1"
// }
export const setLCDMessage = (
	baseURL: string,
	controllerNum: number,
	message: string
) => {
	const datatype = DATATYPE_LCD;
	// As the LCD Screen message buffer is not reset, we use this function to format the message (20 characters)
	const formatedMessage = formatLCDMessage(message);
	return request
		.post({
			url: `${baseURL}/controller/${controllerNum}`,
			headers: {
				'content-type': 'application/json'
			},
			body: {
				datatype: datatype,
				data: formatedMessage
			},
			json: true
		})
		.then(response => {
			console.log('SETLCDMESSAGE RESPONSE', response);
		})
		.catch(err => {
			console.log('SETLCDMESSAGE TODO HANDLE ERR', err.message);
			throw err;
		});
};

// http://localhost:3330/controller/1
// {
//   "datatype": "RTC"
// }
export const setRTC = (baseURL: string, controllerNum: number) => {
	const datatype = DATATYPE_RTC;
	return request
		.post({
			url: `${baseURL}/controller/${controllerNum}`,
			headers: {
				'content-type': 'application/json'
			},
			body: {
				datatype: datatype
			},
			json: true
		})
		.then(response => {
			console.log('SETRTC RESPONSE', response);
		})
		.catch(err => {
			console.log('TODO HANDLE ERR', err);
			throw err;
		});
};

// GET
// http://localhost:3330/controller/1?datatype=IU
const getAllEvents = () => 0;

// const writeIUNumberList = (controllerNum: number, locationStart: string, iuNumberList: string []) => {
//   return iuNumberList.map((iuNumber, index) => writeIU(controllerNum, parseInt() ))
// }

// setLCDMessage(4, '2', 'Message from Thomas ');
// getLCDMessage(4);
// writeIU(4, '2', '0000000000')
// getAllIU(4);

// for (let i = 0; i < 100; i++) {
// 	if (i < 10) {
// 		writeIU(4, `${i}`, `000000000${i}`);
// 	} else {
// 		writeIU(4, `${i}`, `00000000${i}`);
// 	}
// }
