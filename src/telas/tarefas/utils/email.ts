import { toLocalInput } from "../context/TaskContext";
import { normalize } from "./busca";

// Transforma um e-mail colado em título + prazo (US13).
// Título: o "Assunto:" (sem RE:/ENC:), ou a primeira linha. Prazo: a primeira data do texto
// ("15/11", "15/11/2026", "15 de novembro", "hoje", "amanhã", "sexta"), com hora se tiver ("23h59", "14:00").
// Sem data no texto, o prazo fica para daqui a 7 dias.

const HEADER = /^\s*(de|para|cc|data|date|from|to|enviado|sent)\s*:/i;
const MONTHS = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAYS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

export function parseEmail(raw: string, now = new Date()): { title: string; dueDate: string } {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const subject = lines.find(l => /^(assunto|subject)\s*:/i.test(l))?.replace(/^[^:]*:\s*/, "");
  const title = (subject ?? lines.find(l => !HEADER.test(l)) ?? "")
    .replace(/^((re|res|enc|fw|fwd)\s*:\s*)+/i, "").slice(0, 120);
  // Cabeçalhos ficam de fora: a data de envio não é o prazo
  const body = normalize(lines.filter(l => !HEADER.test(l) && !/^(assunto|subject)\s*:/i.test(l)).join(" "));
  return { title, dueDate: toLocalInput(findDate(body, now) ?? new Date(now.getTime() + 7 * 864e5)) };
}

function findDate(text: string, now: Date): Date | null {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let day: Date | null = null;
  let explicitYear = false;

  const num = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  const ext = text.match(new RegExp(`\\b(\\d{1,2}) de (${MONTHS.join("|")})(?: de (\\d{4}))?`));
  const rel = text.match(/\b(depois de amanha|amanha|hoje)\b/);
  const wd = text.match(new RegExp(`\\b(${WEEKDAYS.join("|")})(?:-feira)?\\b`));

  if (num) {
    const y = num[3] ? Number(num[3].length === 2 ? `20${num[3]}` : num[3]) : today.getFullYear();
    explicitYear = !!num[3];
    day = new Date(y, Number(num[2]) - 1, Number(num[1]));
  } else if (ext) {
    explicitYear = !!ext[3];
    day = new Date(ext[3] ? Number(ext[3]) : today.getFullYear(), MONTHS.indexOf(ext[2]), Number(ext[1]));
  } else if (rel) {
    day = new Date(today);
    day.setDate(day.getDate() + (rel[1] === "hoje" ? 0 : rel[1] === "amanha" ? 1 : 2));
  } else if (wd) {
    day = new Date(today);
    day.setDate(day.getDate() + ((WEEKDAYS.indexOf(wd[1]) - today.getDay() + 7) % 7));
  }
  if (!day || isNaN(day.getTime())) return null;

  // "23h59", "14h", "14:30"; sem hora, vale até o fim do dia
  const time = text.match(/\b(?:as |ate as )?([01]?\d|2[0-3])(?:h|:)([0-5]\d)?\b/);
  if (time) day.setHours(Number(time[1]), Number(time[2] ?? 0));
  else day.setHours(23, 59);

  if (day.getTime() <= now.getTime()) {
    if (wd && !num && !ext && !rel) day.setDate(day.getDate() + 7);
    else if ((num || ext) && !explicitYear) day.setFullYear(day.getFullYear() + 1);
    else return null; // prazo que já passou
  }
  return day;
}
