import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyD_rMTlFUE795x04FfVJB6CsHfO1uPyGQA",
  authDomain: "imageupload-458e9.firebaseapp.com",
  projectId: "imageupload-458e9",
  storageBucket: "imageupload-458e9.appspot.com",
  messagingSenderId: "891429957687",
  appId: "1:891429957687:web:5e7bc397781329883ccfb2"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export { storage, app as default };
