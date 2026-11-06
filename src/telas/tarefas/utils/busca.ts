// Busca tolerante a erros (US12): ignora acentos e maiúsculas e aceita palavras com letras trocadas,
// faltando ou sobrando ("relatrio" acha "relatório", "trino" acha "treino")

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Distância de edição (Levenshtein) entre duas palavras
function editDistance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++)
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

// Cada palavra digitada precisa bater com alguma palavra do texto: igual, como começo dela,
// ou com até 1 erro (2 erros em palavras de 6 letras ou mais)
export function fuzzyMatch(query: string, text: string) {
  const words = normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
  return normalize(query).split(/\s+/).filter(Boolean).every(q => {
    const tol = q.length >= 6 ? 2 : q.length >= 3 ? 1 : 0;
    return words.some(w => w.startsWith(q) || editDistance(q, w.slice(0, q.length + tol)) <= tol);
  });
}
