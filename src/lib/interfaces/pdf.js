// @ts-ignore
import { browser } from '$app/environment';
import Error from '$lib/components/Error.svelte';
import { globals } from '$lib/globals';
import { ajax } from '$lib/utils/ajax';

export class Pdf {
	static fontSizes = {
		vsm: '8px',
		sm: '10px',
		mid: '14px',
		lg: '22px',
		vlg: '30px'
	};

	static colors = {
		'blue-dark': '#234c8c',
		'gray-light': '#969ba5',
		'white': '#fff'
	};

	static origin = browser ? window.location.origin : undefined;

	static style = `@import url(${this.origin}/assets/fonts/Ubuntu.css');
			*,
			*::before,
			*::after {
			margin: 0;	
      padding: 0;
      box-sizing: border-box;
			}

      body{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
			width: 100%;
			height: 100%;
			position: relative;
			font-family: 'Ubuntu', system-ui !important;

      main {
      width: 100%;
      height: 100%;
      }
    }`;

	constructor(
		/**@type {String} */ style = '.warning {text-align: center; color: red; margin-top: 20px;}',
		/**@type {String} */ html = '<p class="warning">No valid HTML supplied</p>'
	) {
		this.style = style;
		this.html = html;

		Object.preventExtensions(this);
	}

	get head() {
		return `<head> <style> ${Pdf.style + this.style} </style> </head>`;
	}

	get docHTML() {
		return this.head + `<body> <main> ${this.html} </main> </body>`;
	}

	setStyle(/**@type {String}*/ style) {
		this.style = style;
	}

	setHtml(/**@type {String}*/ html) {
		this.html = html;
	}

	async printContent() {
		const main = document.getElementsByTagName('main')[0];

		let err;

		if (!err) err = new Error({ target: main });

		const data = await ajax({
			url: '/api/dom-to-pdf',
			params: { content: this.docHTML, orientation: 'portrait' }
		}).postAndGetText();

		if (typeof data !== 'string' && data.error) throw new Error(data.error);

		let fileURL;
		try {
			fileURL = globals.generated + data.split('/').slice(-1)[0];
			const newWindow = window.open();

			newWindow.location.href = fileURL;
		} catch (error) {
			console.log(error);
			err.showError = true;
			err.content = `<p> Похоже, у вас заблокированы всплывающие окна, либо установлен блокировщик рекламы. </p> <br/> <p> Для загрузки документа воспользуйтесь <a href="${fileURL}"> ссылкой. </a> </p>`;
		}

		//free memory resources
		this.setStyle('');
		this.setHtml('');
	}
}
