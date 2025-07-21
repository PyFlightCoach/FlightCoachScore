import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import { centralDirectoryHeader, localFileHeader, parseZipArchive, ZippedFile, endOfCentralDirectoryRecord } from '$lib/utils/ziparchive';

describe('Test handling of zip archives', async () => {

  const p25buff = fs.readFileSync('static/example_p25.zip').buffer;
  const binbuff = fs.readFileSync('static/flightlog.zip').buffer;

  it('should be a buffer of the file data', async ()=>{
    expect(p25buff).toBeDefined();
    expect(p25buff.byteLength).toBe(11315306);
  });

  it('should find a central directory header', async ()=>{
    const dv = new DataView((p25buff));
    const offset = centralDirectoryHeader.findSignatureReverse(dv);
    expect(dv.byteLength - offset).toBe(129);

    expect(centralDirectoryHeader.read(dv, offset)).toEqual({
      signature: 0x02014b50,
      relativeOffsetOfLocalHeader: 9784756,
      lastModFileTime: 31268,
      lastModFileDate: 23283,
      versionMadeBy: 831,
      versionNeeded: 788,
      generalPurposeBitFlag: 0,
      compressionMethod: 8,
      crc32: 4152796175,
      compressedSize: 1530273,
      uncompressedSize: 7403037,
      fileNameLength: 25,
      externalFileAttributes: 2176090144,
      diskNumberStart: 0,
      extraField: "\n",
      extraFieldLength: 36,
      fileComment: "",
      fileCommentLength: 0,
      fileName: "example_p25.analysis.json",
      internalFileAttributes: 0
    });

  });

  it ('should process the zip archive', async () => {
    const files = parseZipArchive(p25buff);
    expect(files).toHaveLength(2);
    expect(files[0]).toBeInstanceOf(ZippedFile);
    expect(files[0].fileName).toBe('example_p25.BIN');
    expect(files[0].compressionMethod).toBe(8);
    expect(files[1].fileName).toBe('example_p25.analysis.json');
    expect(files[1].compressionMethod).toBe(8);
  });

  it ('lzma should be able to decompress the flight log',{ timeout: 60000 }, async () => {
    const files = parseZipArchive(binbuff);
    expect(files).toHaveLength(1);
    expect(files[0]).toBeInstanceOf(ZippedFile);
    expect(files[0].fileName).toBe('flightlog.bin');
    expect(files[0].compressionMethod).toBe(14);

    const view = new DataView(binbuff);
   
    expect(files[0].centralDirectoryHeader.relativeOffsetOfLocalHeader).toBe(0);
    
    expect(localFileHeader.length(view, 0) + files[0].compressedSize).toBe(centralDirectoryHeader.findSignatureReverse(view));

    expect(files[0].compressedSize).toBe(files[0].data.byteLength);

    const binbuffer = await files[0].decompress();
    expect(binbuffer).toBeInstanceOf(ArrayBuffer);
    expect(binbuffer.byteLength).toBe(files[0].uncompressedSize); // 1MB
  }); // Increase timeout for LZMA decompression

});

