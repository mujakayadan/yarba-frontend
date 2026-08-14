import {
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth } from '../firebaseConfig';

export const getFirebaseUser = async (): Promise<FirebaseUser | null> => {
  const auth = await getFirebaseAuth();

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getFirebaseToken = async (): Promise<string | null> => {
  const auth = await getFirebaseAuth();
  return auth.currentUser?.getIdToken(true) ?? null;
};

export const signInWithFirebaseEmail = async (email: string, password: string): Promise<void> => {
  const auth = await getFirebaseAuth();
  await signInWithEmailAndPassword(auth, email, password);
};

export const signInWithFirebaseGoogle = async (): Promise<FirebaseUser> => {
  const auth = await getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const signOutFirebase = async (): Promise<void> => {
  const auth = await getFirebaseAuth();
  await signOut(auth);
};

export const sendFirebasePasswordReset = async (email: string): Promise<void> => {
  const auth = await getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
};

export const changeFirebasePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;

  if (!user?.email) {
    throw new Error('You must be logged in to change your password');
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};
