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

export * from './functions';
