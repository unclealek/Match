import { useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestore(collectionName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleFirestoreError = (err: unknown) => {
    console.error(`Firestore error in ${collectionName}:`, err);
    if (err instanceof FirestoreError) {
      // Handle specific Firestore errors
      switch (err.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to perform this action');
        case 'not-found':
          throw new Error('The requested document was not found');
        case 'already-exists':
          throw new Error('A document with this ID already exists');
        default:
          throw new Error(`Database error: ${err.message}`);
      }
    } else if (err instanceof Error) {
      throw err;
    } else {
      throw new Error('An unknown error occurred');
    }
  };

  const getDocument = async (docId: string) => {
    console.log(`Getting document ${docId} from ${collectionName}...`);
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      setLoading(false);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        console.log(`Successfully retrieved document:`, data);
        return data;
      }
      console.log(`Document ${docId} not found`);
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      throw handleFirestoreError(err);
    }
  };

  const getDocuments = async (constraints?: QueryConstraint[]) => {
    console.log(`Getting documents from ${collectionName} with constraints:`, constraints);
    setLoading(true);
    try {
      const collectionRef = collection(db, collectionName);
      const q = constraints 
        ? query(collectionRef, ...constraints)
        : collectionRef;
      
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Retrieved ${documents.length} documents from ${collectionName}`);
      setLoading(false);
      return documents;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      throw handleFirestoreError(err);
    }
  };

  const addDocument = async (data: DocumentData) => {
    console.log(`Adding document to ${collectionName}:`, data);
    setLoading(true);
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now()
      });
      console.log(`Successfully added document with ID: ${docRef.id}`);
      setLoading(false);
      return docRef.id;
    } catch (err) {
      console.error('Error adding document:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      throw handleFirestoreError(err);
    }
  };

  const setDocument = async (docId: string, data: DocumentData) => {
    console.log(`Setting document ${docId} in ${collectionName}:`, data);
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`Successfully set document ${docId}`);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      throw handleFirestoreError(err);
    }
  };

  const updateDocument = async (docId: string, data: Partial<DocumentData>) => {
    console.log(`Updating document ${docId} in ${collectionName}:`, data);
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      console.log(`Successfully updated document ${docId}`);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      throw handleFirestoreError(err);
    }
  };

  const deleteDocument = async (docId: string) => {
    console.log(`Deleting document ${docId} from ${collectionName}`);
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      console.log(`Successfully deleted document ${docId}`);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      throw handleFirestoreError(err);
    }
  };

  return {
    loading,
    error,
    getDocument,
    getDocuments,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument
  };
}
