const TRANSLATE_API_URL = process.env.TRANSLATE_API_URL || 'http://localhost:5001/translate';

export async function translateToRu(text: string): Promise<string> {
  if (!text) return '';
  try {
    const res = await fetch(`${TRANSLATE_API_URL}?sl=ro&dl=ru&text=${encodeURIComponent(text)}`, {
      next: { revalidate: 0 },
    });
    const data = await res.json();
    return data['destination-text'] || text;
  } catch {
    return text; // fallback la română
  }
}