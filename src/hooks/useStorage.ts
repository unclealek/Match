import { useState } from 'react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask
} from 'firebase/storage';
import { storage } from '../config/firebase';

export function useStorage() {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const uploadFile = (
    file: File,
    path: string,
    metadata?: { [key: string]: string }
  ): UploadTask => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      ...metadata
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        setError(error instanceof Error ? error : new Error('Upload failed'));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadUrl);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to get download URL'));
        }
      }
    );

    return uploadTask;
  };

  const deleteFile = async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete file'));
      throw err;
    }
  };

  const getFileUrl = async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      const downloadUrl = await getDownloadURL(storageRef);
      setUrl(downloadUrl);
      return downloadUrl;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get file URL'));
      throw err;
    }
  };

  return {
    progress,
    error,
    url,
    uploadFile,
    deleteFile,
    getFileUrl
  };
}
