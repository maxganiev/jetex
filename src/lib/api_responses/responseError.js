export const responseError = (/**@type {string} */ errorMsg, /**@type {String}*/ responseType = 'html' || 'json') => {
	if (responseType === 'html')
		return new Response(
			`<body style="margin:0; padding: 0"><div style="width: 100%; height: 100vh; margin:0; padding: 0; display: flex; justify-content: center; align-items: center; background: #dee2e6; font-size: 26px; color: #dc3545"> <p> ${errorMsg} </p>  </div> </body>`,
			{ headers: { 'Content-type': 'text/html; charset=utf-8' } }
		);

	return new Response(JSON.stringify({ status: 500, errorMsg }));
};
