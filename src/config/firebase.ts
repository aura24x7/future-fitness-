import { getFirestore } from 'firebase/firestore';
import app, { auth } from './firebaseInit';

// Get Firestore instance
const db = getFirestore(app);

export { auth, db };
export default app;
