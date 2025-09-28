type FileReaderMethodNames =
	| 'readAsText'
	| 'readAsArrayBuffer'
	| 'readAsDataURL'
	| 'readAsBinaryString';


export async function cat(f: File, method: FileReaderMethodNames = 'readAsText') {
	return await new Promise((resolve) =>
		Object.assign(new FileReader(), {
			onload() {
				resolve(this.result);
			}
		})[method](f)
	);
}
