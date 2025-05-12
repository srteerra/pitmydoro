import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/messaging";
import "firebase/compat/functions";
import { getAuth } from '@firebase/auth';
import '@firebase/firestore';
import { environment } from "@/environments/environment.dev";

let firebaseApp: any;
if (!firebase.apps.length) {
  firebaseApp = firebase.initializeApp(environment.firebase);
  firebase.firestore().settings({ experimentalForceLongPolling: true });
}

const db = firebase.firestore();
const auth = getAuth(firebaseApp);
const storage = firebase.storage();

export { firebase, db, auth, firebaseApp, storage };