import * as functions from 'firebase-functions';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export var helloWorld = functions.https.onRequest(function (request, response) {
    response.send("Hello from Firebase!");
});
export var helloWorld2 = functions.https.onCall(function (request, response) {
    return ("Hello from Firebase!");
});
//# sourceMappingURL=index.js.map