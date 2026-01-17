/**
 * Cyrillic to Latin transliteration utility
 * 
 * Converts Russian text to URL-friendly Latin slugs
 */

// Russian to Latin character mapping (ISO 9 based with simplifications)
const CYRILLIC_TO_LATIN: Record<string, string> = {
  // Lowercase
  'а': 'a',
  'б': 'b',
  'в': 'v',
  'г': 'g',
  'д': 'd',
  'е': 'e',
  'ё': 'yo',
  'ж': 'zh',
  'з': 'z',
  'и': 'i',
  'й': 'y',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'о': 'o',
  'п': 'p',
  'р': 'r',
  'с': 's',
  'т': 't',
  'у': 'u',
  'ф': 'f',
  'х': 'kh',
  'ц': 'ts',
  'ч': 'ch',
  'ш': 'sh',
  'щ': 'shch',
  'ъ': '',
  'ы': 'y',
  'ь': '',
  'э': 'e',
  'ю': 'yu',
  'я': 'ya',
  // Uppercase
  'А': 'A',
  'Б': 'B',
  'В': 'V',
  'Г': 'G',
  'Д': 'D',
  'Е': 'E',
  'Ё': 'Yo',
  'Ж': 'Zh',
  'З': 'Z',
  'И': 'I',
  'Й': 'Y',
  'К': 'K',
  'Л': 'L',
  'М': 'M',
  'Н': 'N',
  'О': 'O',
  'П': 'P',
  'Р': 'R',
  'С': 'S',
  'Т': 'T',
  'У': 'U',
  'Ф': 'F',
  'Х': 'Kh',
  'Ц': 'Ts',
  'Ч': 'Ch',
  'Ш': 'Sh',
  'Щ': 'Shch',
  'Ъ': '',
  'Ы': 'Y',
  'Ь': '',
  'Э': 'E',
  'Ю': 'Yu',
  'Я': 'Ya',
};

/**
 * Transliterate text from Cyrillic to Latin
 * 
 * @param text - Text to transliterate
 * @returns Transliterated text
 * 
 * @example
 * transliterate("Привет мир") // "Privet mir"
 * transliterate("Юридические услуги") // "Yuridicheskie uslugi"
 */
export function transliterate(text: string): string {
  if (!text) return '';
  
  return text
    .split('')
    .map(char => CYRILLIC_TO_LATIN[char] ?? char)
    .join('');
}

/**
 * Generate a URL-friendly slug from text
 * 
 * - Transliterates Cyrillic characters to Latin
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Removes multiple consecutive hyphens
 * 
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 * 
 * @example
 * generateSlug("Привет мир!") // "privet-mir"
 * generateSlug("Юридические услуги") // "yuridicheskie-uslugi"
 * generateSlug("Hello World") // "hello-world"
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return transliterate(text)
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters (keep only letters, numbers, hyphens)
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

