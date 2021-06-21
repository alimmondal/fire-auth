import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

firebase.initializeApp(firebaseConfig);

function App() {
  
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
  })

  var provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleGoogleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then(res => {
        const { displayName, photoURL, email } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);
        console.log(displayName, photoURL, email);
      })
      .catch(err => {
        console.log(err);
        console.log(err.message);
      })
  }


  //Fb Sign In handler 
  const handleFbSignIn = () => {
    firebase
  .auth()
  .signInWithPopup(fbProvider)
  .then((result) => {
    var credential = result.credential;
    var user = result.user;
    var accessToken = credential.accessToken;
    console.log(user, accessToken)
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
    console.log(errorCode, errorMessage, email, credential)
  });
  }


  const handleGoogleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          photo: '',
          error: '',
          success: '',
        }
        setUser(signedOutUser);
        console.log(res);
      }).catch((error) => {
        console.log(error);
      });
  }


  //created user with email and password
  const handleBlur = (event) => {
    let isFieldValid = true;
    console.log(event.target.name, event.target.value)
    if (event.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }
  //
  const handleSubmit = (e) => {
    // console.log(user.email, user.password);
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log(res.user)
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }


  //update user info
  const updateUserName = (name) => {
    const user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name
      
    }).then(() => {
      console.log('Update user name')
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <div className="App">

      {
        user.isSignedIn ? <button onClick={handleGoogleSignOut}>Sign Out</button> :
          <button onClick={handleGoogleSignIn}>Sign In With Google</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Sign In Using Facebook</button>

      {
        user.isSignedIn && <div>
          <p>Welcome {user.name}</p>
          <p>Your email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }

      

      <h1>Our own authentication</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email} </p>
      <p>Password: {user.password}</p>

      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign Up</label>

      <form onSubmit={handleSubmit}>
        {newUser && <input onBlur={handleBlur} type="text" name="name" placeholder="Your Name" id="" />
        }
        <br />
        <input type="email" onBlur={handleBlur} name="email" placeholder="your email address" id="" required />
        <br />
        <input type="password" onBlur={handleBlur} name="password" placeholder="Password" id="" required />
        <br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}  />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {user.success && <p style={{ color: 'green' }}>User {newUser ? ' created' : 'logged in'} successfully</p>}




    </div>
  );
}

export default App;
