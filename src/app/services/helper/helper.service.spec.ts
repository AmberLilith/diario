
import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { HelperService } from './helper.service';

describe('HelperService', () => {
  let service: HelperService;

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      HelperService,
      DatePipe
    ]
  });
  service = TestBed.inject(HelperService);
});

  it('Given a string with a img with valid URL when callink getAllPhotosPaths then should retorn the path', () => {
    //given
    const tagString: string = "<img src='https://xxx.supabase.co/storage/v1/object/sign/entry-photos/userId/temp/1234.jpg?token=abc'/>";

    //when
    const path = (service as any).getAllPhotosPaths(tagString);

    //then
    expect(path[0]).toBe("userId/temp/1234.jpg");
  });

  it('Given a string with several imgs with valid URL when callink getAllPhotosPaths then should retorn the path', () => {
    //given
    const tagString: string = `<img src='https://xxx.supabase.co/storage/v1/object/sign/entry-photos/userId/temp/1234.jpg?token=abc'/> 
    <img src='https://xxx.supabase.co/storage/v1/object/sign/entry-photos/userId/temp/4789.jpg?token=abc'/>`;

    //when
    const path = (service as any).getAllPhotosPaths(tagString);

    //then
    expect(path.length > 1).toBeTruthy();
    expect(path[0]).toBe("userId/temp/1234.jpg");
    expect(path[1]).toBe("userId/temp/4789.jpg");
  });

  it('Given a string with a img with invalid URL when callink getAllPhotosPaths then should retorn the path', () => {
    //given
    const tagString: string = "<img src='https://xxx'/>";

    //when
    const path = (service as any).getAllPhotosPaths(tagString);

    //then
    expect(path).toEqual([]);
  });

  it('Given a string without a img when callink getAllPhotosPaths then should retorn the path', () => {
    //given
    const tagString: string = "abc";

    //when
    const path = (service as any).getAllPhotosPaths(tagString);

    //then
    expect(path).toEqual([]);
  });

  it('Given a null value when callink getAllPhotosPaths then should retorn the path', () => {
    //given
    const tagString: string | null = null;

    //when
    const path = (service as any).getAllPhotosPaths(tagString);

    //then
    expect(path).toEqual([]);
  });

  it('Given a undefined value when callink getAllPhotosPaths then should retorn the path', () => {
    //given
    const tagString: string | undefined = undefined;

    //when
    const path = (service as any).getAllPhotosPaths(tagString);

    //then
    expect(path).toEqual([]);
  });

  it('Given a valid Supabase url when calling validarUrlSupabase then should return true', () => {
    //given
    const url = "https://xxx.supabase.co/storage/v1/object/sign/entry-photos/userId/temp/1234.jpg?token=abc";

    //when
    const result = (service as any).validarUrlSupabase(url);

    //then
    expect(result).toBeTrue();
  });

  it('Given a invalid Supabase url when calling validarUrlSupabase then should return false', () => {
    //given
    const url = "abc";

    //when
    const result = (service as any).validarUrlSupabase(url);

    //then
    expect(result).toBeFalse();
  });

  it('Given a null Supabase url when calling validarUrlSupabase then should return false', () => {
    //given
    const url = null;

    //when
    const result = (service as any).validarUrlSupabase(url);

    //then
    expect(result).toBeFalse();
  });

  it('Given a empty Supabase url when calling validarUrlSupabase then should return false', () => {
    //given
    const url = "";

    //when
    const result = (service as any).validarUrlSupabase(url);

    //then
    expect(result).toBeFalse();
  });

  it('Given a valid date when calling formatDate then should return a fommated date', () => {
    //given
    const rawDate = "2023-09-24 21:04:00.841562";

    //when
    const result = (service as any).formatDate(rawDate);

    //then
    expect(result).toEqual("24/09/2023 - 21:04:00");
  });

  it('Given a invalid date when calling formatDate then should return a fommated date', () => {
    //given
    const invalidDate = "abc";

    //when
    const result = (service as any).formatDate(invalidDate);

    //then
    expect(result).toBeNull();
  });

  it('Given a empty date when calling formatDate then should return a fommated date', () => {
    //given
    const invalidDate = "";

    //when
    const result = (service as any).formatDate(invalidDate);

    //then
    expect(result).toBeNull();
  });


});


