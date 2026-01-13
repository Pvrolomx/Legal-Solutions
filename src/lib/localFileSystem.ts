// Local File System Access API wrapper
import { saveHandle, getHandle, clearHandle } from './fsHandleStore';

export interface LocalFile {
  name: string;
  size: number;
  lastModified: number;
}

let directoryHandle: FileSystemDirectoryHandle | null = null;

// Verificar si el navegador soporta File System Access API
export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// Solicitar permiso a carpeta
export async function requestDirectory(): Promise<boolean> {
  if (!isSupported()) {
    return false;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    directoryHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });
    
    // Guardar handle para persistir
    if (directoryHandle) {
      await saveHandle(directoryHandle);
    }
    return true;
  } catch (err) {
    // Usuario canceló o error
    console.error('Error seleccionando carpeta:', err);
    return false;
  }
}

// Verificar si tenemos acceso (con permiso vigente)
export async function hasAccess(): Promise<boolean> {
  if (!directoryHandle) {
    directoryHandle = await getHandle();
  }
  
  if (!directoryHandle) return false;

  try {
    // Verificar que aún tenemos permiso
    const permission = await directoryHandle.queryPermission({ mode: 'readwrite' });
    if (permission === 'granted') return true;
    
    // Intentar solicitar permiso de nuevo
    const newPermission = await directoryHandle.requestPermission({ mode: 'readwrite' });
    return newPermission === 'granted';
  } catch {
    return false;
  }
}

// Obtener nombre de carpeta
export async function getFolderName(): Promise<string | null> {
  if (!directoryHandle) {
    directoryHandle = await getHandle();
  }
  return directoryHandle?.name || null;
}

// Listar archivos en carpeta
export async function listFiles(): Promise<LocalFile[]> {
  if (!directoryHandle) {
    directoryHandle = await getHandle();
  }
  
  if (!directoryHandle) return [];

  const files: LocalFile[] = [];
  
  try {
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'file') {
        const file = await (entry as FileSystemFileHandle).getFile();
        files.push({
          name: entry.name,
          size: file.size,
          lastModified: file.lastModified
        });
      }
    }
  } catch (err) {
    console.error('Error listando archivos:', err);
  }

  return files.sort((a, b) => b.lastModified - a.lastModified);
}

// Guardar archivo
export async function saveFile(name: string, blob: Blob): Promise<boolean> {
  if (!directoryHandle) {
    directoryHandle = await getHandle();
  }
  
  if (!directoryHandle) return false;

  try {
    const fileHandle = await directoryHandle.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (err) {
    console.error('Error guardando archivo:', err);
    return false;
  }
}

// Leer archivo
export async function getFile(name: string): Promise<File | null> {
  if (!directoryHandle) {
    directoryHandle = await getHandle();
  }
  
  if (!directoryHandle) return null;

  try {
    const fileHandle = await directoryHandle.getFileHandle(name);
    return await fileHandle.getFile();
  } catch {
    return null;
  }
}

// Eliminar archivo
export async function deleteFile(name: string): Promise<boolean> {
  if (!directoryHandle) {
    directoryHandle = await getHandle();
  }
  
  if (!directoryHandle) return false;

  try {
    await directoryHandle.removeEntry(name);
    return true;
  } catch (err) {
    console.error('Error eliminando archivo:', err);
    return false;
  }
}

// Limpiar carpeta seleccionada
export async function clearSelectedFolder(): Promise<void> {
  directoryHandle = null;
  await clearHandle();
}
