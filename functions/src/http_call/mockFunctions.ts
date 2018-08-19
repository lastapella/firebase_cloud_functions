
export const getDummyLCDMessage = (baseURL: string, controllerNum: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(
			() =>
				resolve(
					`getDummyLCDMessage at URL: ${baseURL}, portNum : ${controllerNum}`
				),
			1000
		);
	});
};
