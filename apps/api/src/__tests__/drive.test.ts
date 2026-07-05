import { describe, it, expect } from 'vitest';
import './_setup';
import { extractDriveFolderId } from '../services/drive.service';

describe('services/drive.service extractDriveFolderId', () => {
  it('extracts from standard folder URL', () => {
    expect(
      extractDriveFolderId('https://drive.google.com/drive/folders/abc123def456ghi789jkl')
    ).toBe('abc123def456ghi789jkl');
  });

  it('extracts from /u/N/ URLs', () => {
    expect(
      extractDriveFolderId('https://drive.google.com/drive/u/0/folders/zzz999xxx888yyy777www')
    ).toBe('zzz999xxx888yyy777www');
  });

  it('extracts from /folder/ alias', () => {
    expect(
      extractDriveFolderId('https://drive.google.com/folder/aaa111bbb222ccc333ddd')
    ).toBe('aaa111bbb222ccc333ddd');
  });

  it('extracts from /file/d/ URLs', () => {
    expect(
      extractDriveFolderId('https://drive.google.com/file/d/qqq111www222eee333rrr444')
    ).toBe('qqq111www222eee333rrr444');
  });

  it('accepts a bare ID that looks like a Drive ID', () => {
    expect(extractDriveFolderId('zzz999xxx888yyy777www')).toBe('zzz999xxx888yyy777www');
  });

  it('rejects garbage input', () => {
    expect(() => extractDriveFolderId('not a url')).toThrow();
    expect(() => extractDriveFolderId('')).toThrow();
    expect(() => extractDriveFolderId('https://example.com/foo')).toThrow();
  });
});
