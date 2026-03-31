
import { EntriesService } from './entries.service';

describe('EntriesService', () => {
  let service: EntriesService;

beforeEach(() => {
  const supabaseMock = {} as any;
  const authMock = {} as any;
  service = new EntriesService(supabaseMock, authMock);
});

  it('Given string with html tag, when calling extractText should return text without tags', () => {
    //Given
    const entry: string = "<p> ola mundo <p>";

    //When
    const result: string = (service as any).extractText(entry);

    //Then
    expect(result).toBe("ola mundo");
  });

  it('Given string with several spaces, when calling extractText should return text without spaces', () => {
    //Given
    const entry: string = "ola              mundo              ";

    //When
    const result: string = (service as any).extractText(entry);

    //Then
    expect(result).toBe("ola mundo");
  });

  it('Given string with line break, when calling extractText should return only text', () => {
    //Given
    const entry: string = `ola 
    mundo`;

    //When
    const result: string = (service as any).extractText(entry);

    //Then
    expect(result).toBe("ola mundo");
  });

  it('Given a empty string, when calling extractText should empty string', () => {
    //Given
    const entry: string = "";

    //When
    const result: string = (service as any).extractText(entry);

    //Then
    expect(result).toBe("");
  });

  it('Given string with only text, when calling extractText should the same text', () => {
    //Given
    const entry: string = "ola mundo";

    //When
    const result: string = (service as any).extractText(entry);

    //Then
    expect(result).toBe("ola mundo");
  });

  it('Given string with upcase caracters, when calling extractText should return text with only lowcase caracters', () => {
    //Given
    const entry: string = "OLA MUNDO";

    //When
    const result: string = (service as any).extractText(entry);

    //Then
    expect(result).toBe("ola mundo");
  });
});