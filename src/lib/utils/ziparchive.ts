//a class to handle a zip archive arraybuffer and return the individual files to be unzipped
import { sum, objmap } from './arrays';
import { decompress } from 'lzma1';


function getString(view: DataView, offset: number, length: number): string {
	const end = offset + length;
	let text = '';
	let val: number;

	while (offset < end) {
		val = view.getUint8(offset++);
		if (val == 0) break;
		text += String.fromCharCode(val);
	}

	return text;
}

class FixedHeaderField {
	constructor(
		readonly start: number,
		readonly length: number,
		readonly asString?: boolean
	) {}

	read(view: DataView, offset: number): number | string {
		if (this.asString) {
			return getString(view, offset + this.start, this.length);
		} else {
			switch (this.length) {
				case 1:
					return view.getUint8(offset + this.start);
				case 2:
					return view.getUint16(offset + this.start, true);
				case 4:
					return view.getUint32(offset + this.start, true);
				default:
					throw new Error(`Unsupported length ${this.length} for non string FixedHeaderField`);
			}
		}
	}
}

function getFixedOffsetValue(
	fixedOffsets: Record<string, FixedHeaderField>,
	key: string | number,
	view: DataView,
	offset: number
): number {
	if (typeof key === 'number') {
		return key;
	} else if (key in fixedOffsets) {
		return fixedOffsets[key].read(view, offset) as number;
	} else {
		throw new Error(`Key ${key} not found in fixed offsets`);
	}
}

class FloatingHeaderField {
	constructor(
		readonly starts: (number | string)[],
		readonly length: number | string
	) {}

	getStart(fixedOffsets: Record<string, FixedHeaderField>, view: DataView, offset: number): number {
		return sum(
			this.starts.map((s) => getFixedOffsetValue(fixedOffsets, s, view, offset) as number)
		);
	}

	getLength(fixedOffsets: Record<string, FixedHeaderField>, view: DataView, offset: number) {
		return getFixedOffsetValue(fixedOffsets, this.length, view, offset) as number;
	}

	createFixedOffset(
		fixedOffsets: Record<string, FixedHeaderField>,
		view: DataView,
		offset: number
	): FixedHeaderField {
		return new FixedHeaderField(
			this.getStart(fixedOffsets, view, offset),
			this.getLength(fixedOffsets, view, offset),
			true
		);
	}

	read(fixedOffsets: Record<string, FixedHeaderField>, view: DataView, offset: number) {
		this.createFixedOffset(fixedOffsets, view, offset).read(view, offset);
	}
}

export class ZipFileHeader {
	constructor(
		readonly signature: number,
		readonly fixedOffsets: Record<string, FixedHeaderField>,
		readonly floatingOffsets: Record<string, FloatingHeaderField>
	) {}

	get fixedKeys(): string[] {
		return Object.keys(this.fixedOffsets);
	}

	get floatingKeys(): string[] {
		return Object.keys(this.floatingOffsets);
	}

	get keys(): string[] {
		return [...this.fixedKeys, ...this.floatingKeys];
	}

	length(view: DataView, offset: number): number {
		const lastFixedOffset = this.floatingOffsets[
			this.floatingKeys[this.floatingKeys.length - 1]
		].createFixedOffset(this.fixedOffsets, view, offset);
		return lastFixedOffset.start + lastFixedOffset.length;
	}

	createAllFixedOffsets(view: DataView, offset: number): Record<string, FixedHeaderField> {
		return {
			...this.fixedOffsets,
			...objmap(this.floatingOffsets, (fo) => fo.createFixedOffset(this.fixedOffsets, view, offset))
		};
	}

	read(view: DataView, offset: number): Record<string, string | number> {
		const offsets = this.createAllFixedOffsets(view, offset);
		return objmap(offsets, (off) => off.read(view, offset));
	}

	findSignature(view: DataView, lastOffset: number): number {
		for (let i = lastOffset; i < view.byteLength - this.fixedOffsets.signature.length - 1; i++) {
			if (this.fixedOffsets.signature.read(view, i) === this.signature) {
				return i;
			}
		}
		throw new Error(`Signature ${this.signature.toString(16)} not found in view`);
	}

	findSignatureReverse(view: DataView): number {
		for (let i = view.byteLength - this.fixedOffsets.signature.length - 1; i > 0; i = i - 1) {
			if (this.fixedOffsets.signature.read(view, i) === this.signature) {
				return i;
			}
		}
		throw new Error(`Signature ${this.signature.toString(16)} not found in view`);
	}
}

export const localFileHeader = new ZipFileHeader(
	0x04034b50,
	{
		signature: new FixedHeaderField(0, 4),
		versionNeeded: new FixedHeaderField(4, 2),
		generalPurposeBitFlag: new FixedHeaderField(6, 2),
		compressionMethod: new FixedHeaderField(8, 2),
		lastModFileTime: new FixedHeaderField(10, 2),
		lastModFileDate: new FixedHeaderField(12, 2),
		crc32: new FixedHeaderField(14, 4),
		compressedSize: new FixedHeaderField(18, 4),
		uncompressedSize: new FixedHeaderField(22, 4),
		fileNameLength: new FixedHeaderField(26, 2),
		extraFieldLength: new FixedHeaderField(28, 2)
	},
	{
		fileName: new FloatingHeaderField([30], 'fileNameLength'),
		extraField: new FloatingHeaderField(['fileNameLength', 30], 'extraFieldLength')
	}
);

export const centralDirectoryHeader = new ZipFileHeader(
	0x02014b50,
	{
		signature: new FixedHeaderField(0, 4),
		versionMadeBy: new FixedHeaderField(4, 2),
		versionNeeded: new FixedHeaderField(6, 2),
		generalPurposeBitFlag: new FixedHeaderField(8, 2),
		compressionMethod: new FixedHeaderField(10, 2),
		lastModFileTime: new FixedHeaderField(12, 2),
		lastModFileDate: new FixedHeaderField(14, 2),
		crc32: new FixedHeaderField(16, 4),
		compressedSize: new FixedHeaderField(20, 4),
		uncompressedSize: new FixedHeaderField(24, 4),
		fileNameLength: new FixedHeaderField(28, 2),
		extraFieldLength: new FixedHeaderField(30, 2),
		fileCommentLength: new FixedHeaderField(32, 2),
		diskNumberStart: new FixedHeaderField(34, 2),
		internalFileAttributes: new FixedHeaderField(36, 2),
		externalFileAttributes: new FixedHeaderField(38, 4),
		relativeOffsetOfLocalHeader: new FixedHeaderField(42, 4)
	},
	{
		fileName: new FloatingHeaderField([46], 'fileNameLength'),
		extraField: new FloatingHeaderField(['fileNameLength', 46], 'extraFieldLength'),
		fileComment: new FloatingHeaderField(
			['fileNameLength', 'extraFieldLength', 46],
			'fileCommentLength'
		)
	}
);

export const endOfCentralDirectoryRecord = new ZipFileHeader(
	0x06054b50,
	{
		signature: new FixedHeaderField(0, 4),
		diskNumber: new FixedHeaderField(4, 2),
		cdDtartingDiskNumber: new FixedHeaderField(6, 2),
		nRecordsOnDisk: new FixedHeaderField(8, 2),
		nRecords: new FixedHeaderField(10, 2),
		size: new FixedHeaderField(12, 4),
		cdStart: new FixedHeaderField(16, 4),
		commentLength: new FixedHeaderField(20, 2)
	},
	{
		comment: new FloatingHeaderField(['commentLength', 22], 'commentLength')
	}
);

export class ZippedFile {
	constructor(
		readonly centralDirectoryHeader: Record<string, number | string>,
		readonly localFileHeader: Record<string, number | string>,
		readonly data: ArrayBuffer
	) {}

	get fileName(): string {
		return this.centralDirectoryHeader.fileName as string;
	}
	get compressionMethod(): number {
		return this.centralDirectoryHeader.compressionMethod as number;
	}
	get compressedSize(): number {
		return this.centralDirectoryHeader.compressedSize as number;
	}
	get uncompressedSize(): number {
		return this.centralDirectoryHeader.uncompressedSize as number;
	}

	decompress(): Uint8Array {
		if (this.compressionMethod == 14) {
			return decompress(new Uint8Array(this.data));
		} else {
			throw new Error(
				`Unsupported compression method ${this.compressionMethod} for file ${this.fileName}`
			);
		}
	}
}

export function parseZipArchive(arrayBuffer: ArrayBuffer): ZippedFile[] {
	const view = new DataView(arrayBuffer);
	const files: ZippedFile[] = [];

	const eocdrecord = endOfCentralDirectoryRecord.read(
		view,
		endOfCentralDirectoryRecord.findSignatureReverse(view)
	);
	let cdOffset = eocdrecord.cdStart as number;
	for (let i = 0; i < (eocdrecord.nRecords as number); i++) {
		const cdRecord = centralDirectoryHeader.read(view, cdOffset);
		const lfHeaderStart = cdRecord.relativeOffsetOfLocalHeader as number;
		const lfRecord = localFileHeader.read(view, lfHeaderStart);

		const dataStart =
			lfHeaderStart + localFileHeader.length(view, cdRecord.relativeOffsetOfLocalHeader as number);
		const dataEnd = dataStart + (lfRecord.compressedSize as number);
		const lfData = view.buffer.slice(dataStart, dataEnd);
		files.push(new ZippedFile(cdRecord, lfRecord, lfData));

		cdOffset += centralDirectoryHeader.length(view, cdOffset);
	}
	return files;
}
