import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

// Arquivos dos anexos ficam no IndexedDB do WebView: o localStorage não comporta fotos e áudios
const db = new Promise<IDBDatabase>((resolve, reject) => {
  const req = indexedDB.open("ordena-anexos", 1);
  req.onupgradeneeded = () => req.result.createObjectStore("arquivos");
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const run = <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest) =>
  db.then(d => new Promise<T>((resolve, reject) => {
    const req = fn(d.transaction("arquivos", mode).objectStore("arquivos"));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  }));

export const saveBlob = (id: string, blob: Blob) => run<void>("readwrite", s => s.put(blob, id));
export const getBlob = (id: string) => run<Blob | undefined>("readonly", s => s.get(id));
export const deleteBlob = (id: string) => run<void>("readwrite", s => s.delete(id));

const toBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve((r.result as string).split(",")[1]);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});

// No Android o WebView não abre arquivos: grava uma cópia temporária e oferece os apps instalados
export async function openBlob(blob: Blob, name: string) {
  if (!Capacitor.isNativePlatform()) {
    window.open(URL.createObjectURL(blob), "_blank");
    return;
  }
  const { uri } = await Filesystem.writeFile({
    path: name.replace(/[^\w.\-]+/g, "_"),
    data: await toBase64(blob),
    directory: Directory.Cache,
  });
  await Share.share({ title: name, files: [uri] });
}
