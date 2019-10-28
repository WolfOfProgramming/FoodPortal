const db = firebase.firestore();
const storageRefernce = firebase.storage().ref();

const loginFormReference = document.querySelector('#logIn');
const logInButton = document.querySelector('#logInButton');
const signUpReference = document.querySelector('#createANewAccount');
const offline = document.querySelector('#offline');
const loggedIn = document.querySelector('#loggedIn');
const addRecipeReference = document.querySelector('#addRecipeForm');
const changeInformationsAboutYouReference = document.querySelector('#changeInformationsAboutYouButton');
const signOutReference = document.querySelector('#signOut');
const addFriendInputReference = document.querySelector('#addFriendContainer');
const friendsListSectionReference = document.querySelector('#friendsListSection');
const friendRequestsSectionReference = document.querySelector('#friendRequestsSection');
const friendListButton = document.querySelector('#friendsList');
const friendRequestButton = document.querySelector('#friendsRequest');
const recipesContainerReference = document.querySelector('#recipesContainer');
const confirmInformationsAboutYouReference = document.querySelector('#confirmInformationsAboutYou');
const cancelChangingInformationsReference = document.querySelector('#cancelChangingInformations');
const informationsAboutYouReference = document.querySelector('#informations');

const hiddenInputsReference = document.querySelectorAll('.hiddenInput');
const spansOfInformationsReference = document.querySelectorAll('.spansOfInformations');
const sayHelloToUserRefernce = document.querySelector('#sayHelloToUser');

const nameToDisplay = document.querySelector('#nameToRead');
const surenameToDisplay = document.querySelector('#surenameToRead');
const nickToDisplay = document.querySelector('#nickToRead');
const favoriteFoodToDisplay = document.querySelector('#favoriteFoodToRead');
//Use linear gradient to style
const tickReference = document.querySelector('#tick');
const fileReference = document.querySelector('#choosenFile');

firebase.auth().onAuthStateChanged((user) => { 
  if (user) {  
    let currentUserReference = user.email;
    let userDocument = getUserDocument(currentUserReference);

    userDocument.onSnapshot( snapshot => {
      loadFriendRequestsAndFriendsList(snapshot, userDocument);
      showActualUserInformations(snapshot);
    })
    
    addRecipeReference.addEventListener("submit", (event) => {
      event.preventDefault();
      let fileName = addSelectedFileToStorageAndReturnItsName();
      let recipeObject = createRecipeObject(currentUserReference, fileName);
      addRecipeToCloud(recipeObject, currentUserReference);
      tickReference.className = 'hidden';  
      addRecipeReference.reset();
    })

    addFriendInputReference.addEventListener('submit', (event) => {
      event.preventDefault();
      let newFriendReference = addFriendInputReference.friendEmailInput.value;
      addNewFriend(newFriendReference, currentUserReference);
      addFriendInputReference.friendEmailInput.value = '';
    })

    changeInformationsAboutYouReference.addEventListener("click", (event) => {
      event.preventDefault();
      showInputsAndButton(userDocument);
    })

    loadViewAfterLoggingIn();
    setTimeout(() => showMyFriendsPosts(currentUserReference), 2000);
    
    let userName = user.name ? user.name : user.email;
    sayHelloToUserRefernce.textContent = 'Hello ' + userName + '!'; 


  } else {
    resetAllDownloadedData();
  }
})

logInButton.addEventListener('click', (event) => {
  event.preventDefault();
  // eslint-disable-next-line no-undef
  let userEmail = loginFormReference.email.value;
  let userPassword = loginFormReference.password.value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).then( () => {
    //let userDocument = getUserDocument(userEmail);
    //userDocument.onSnapshot( snapshot => {
    //  loadFriendRequestsAndFriendsList(snapshot, userDocument);
    //})
    //loadViewAfterLoggingIn();
    //showMyFriendsPosts(userEmail);
   })
   .catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error(errorMessage, errorCode);
  })
})


signUpReference.addEventListener('click', (event) => {
  event.preventDefault();
  // eslint-disable-next-line no-undef
  let userEmail = loginFormReference.email.value;
  let userPassword = loginFormReference.password.value;

  firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
  
    if (errorCode === 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.error(error);
  }).then( () => {
    addUserObject(userEmail); 
    addToChiefBOB(userEmail);
  });
})

signOutReference.addEventListener("click", (event) => {
  event.preventDefault();
  firebase.auth().signOut().then(function() {
    loadViewAfterSigningOut();
  }).catch(function(error) {
   console.error(error);
  });
})

friendListButton.addEventListener('click', (event) => {
  event.preventDefault();
  friendRequestsSectionReference.className = 'hidden';
  friendsListSectionReference.className = 'show';
  friendListButton.className = 'gradient';
  friendRequestButton.className = 'white';
})

friendRequestButton.addEventListener('click', (event) => {
  event.preventDefault();
  friendsListSectionReference.className = 'hidden';
  friendRequestsSectionReference.className = 'show';
  friendListButton.className = 'white';
  friendRequestButton.className = 'gradient';
})

fileReference.addEventListener('change', (event) => {
  event.preventDefault();
  showTick();
})

function loadViewAfterLoggingIn() {
  offline.className = 'hidden';
  loggedIn.className = 'show';
  window.history.pushState(null, 'page2', '/loggedIn');
}

function loadViewAfterSigningOut() {
  offline.className = 'backOffline';
  loggedIn.className = 'hidden';
  window.history.replaceState(null, 'page1', 'signedOut');
}

function addUserObject(userEmail) {
  db.collection("users").doc(userEmail).set({
    friends: ["Chief BOB"],
    name: "",
    surename: "",
    nick: "",
    favoriteFood: "",
    favoriteDrink: "",
    recipes: [],
    email: userEmail,
    friendsRequests: []
  });
}

function getUserDocument(userEmail) {
  return db.collection("users").doc(userEmail);
}
const ulFriendsReq = document.createElement('ul');
const ulFriends = document.createElement('ul');

function loadFriendRequestsAndFriendsList(snapshotOfDocument, userDocumentRefernece) {
  ulFriendsReq.textContent = '';
  ulFriends.textContent = '';
  let userEmail = snapshotOfDocument.data().email;

  snapshotOfDocument.data().friendsRequests.forEach( (element) => {
    const li = document.createElement('li');
    const spanX = document.createElement('span');
    const spanAdd = document.createElement('span');

    spanX.textContent = 'X';
    spanAdd.textContent = 'Add';
    li.textContent = element;

    spanX.addEventListener("click", (event) => {
      event.preventDefault();
      li.remove();
      userDocumentRefernece.update({
        "friendsRequests": firebase.firestore.FieldValue.arrayRemove(element)
      })
    })
    
    spanAdd.addEventListener("click", (event) => {
      event.preventDefault();
      li.remove();
      userDocumentRefernece.update({
        "friendsRequests": firebase.firestore.FieldValue.arrayRemove(element),
        "friends": firebase.firestore.FieldValue.arrayUnion(element)
      })
      db.collection('users').doc(element.trim()).update({
        "friends": firebase.firestore.FieldValue.arrayUnion(userEmail.trim())
      })
    })

    li.appendChild(spanAdd);
    li.appendChild(spanX);
    ulFriendsReq.appendChild(li);
  })
  snapshotOfDocument.data().friends.forEach( (element) => {
    const li = document.createElement('li');
    const spanX = document.createElement('span');
    spanX.textContent = 'X';
    li.textContent = element;
    spanX.addEventListener("click", (event) => {
      event.preventDefault();
      li.remove();
      userDocumentRefernece.update({
        "friends": firebase.firestore.FieldValue.arrayRemove(element)
      })
      db.collection('users').doc(element.trim()).update({
        "friends": firebase.firestore.FieldValue.arrayRemove(userEmail.trim())
      })
    })
    li.appendChild(spanX);
    ulFriends.appendChild(li);
  })
  friendRequestsSectionReference.appendChild(ulFriendsReq);
  friendsListSectionReference.appendChild(ulFriends);
}

function addRecipeToCloud(recipeObject, userDocumentRefernece) {
  db.collection("users").doc(userDocumentRefernece).update({
    "recipes": firebase.firestore.FieldValue.arrayUnion(recipeObject)
  });
}

function showInputsAndButton(userDocumentRefernece) {
  hiddenInputsReference.forEach( (hiddenInput) => hiddenInput.className = 'show');
  spansOfInformationsReference.forEach( (spanOfInformations) => spanOfInformations.className = 'hidden');

  confirmInformationsAboutYouReference.addEventListener('click', (event) => {
    event.preventDefault();
    userDocumentRefernece.update({
      "name": informationsAboutYouReference.name.value,
      "nick": informationsAboutYouReference.nick.value,
      "surename": informationsAboutYouReference.surename.value,
      "favoriteFood": informationsAboutYouReference.favoriteFood.value
    })
    hiddenInputsReference.forEach( (hiddenInput) => hiddenInput.className = 'hidden');
    spansOfInformationsReference.forEach( (spanOfInformations) => spanOfInformations.className = 'show');
  })

  cancelChangingInformationsReference.addEventListener('click', (event) => {
    event.preventDefault();
    hiddenInputsReference.forEach( (hiddenInput) => hiddenInput.className = 'hidden');
    spansOfInformationsReference.forEach( (spanOfInformations) => spanOfInformations.className = 'show');
  })
}

function addSelectedFileToStorageAndReturnItsName() {
  let fileName = addRecipeReference.choosenFile.files[0].name;
  storageRefernce.child('images/' + fileName).put(addRecipeReference.choosenFile.files[0]);
  return fileName;
}

function showMyFriendsPosts(userEmail) {
  recipesContainerReference.textContent = '';
  db.collection('users').where('friends', 'array-contains', userEmail)
   .get()
   .then( (documentSnapshot) => {
     documentSnapshot.forEach((doc) => {
       let recipes = doc.data().recipes
       recipes.forEach( (recipe) => {
         const div = document.createElement('div');
         const author = document.createElement('h3');
         const title = document.createElement("h2");
         const steps = document.createElement("p");
         const ingredients = document.createElement("p");
         const img = document.createElement('img');
    
         storageRefernce.child('images/' + recipe.file).getDownloadURL().then( (url) => {
           img.src = url;
         })
         author.textContent = `Author: ${recipe.author}`;
         title.textContent = recipe.nameOfFood;
         steps.textContent = `Steps: ${recipe.steps}`;
         ingredients.textContent = `Ingredients: ${recipe.ingredients}`;
         div.className = 'recipeDisplay';
        
         div.appendChild(author);
         div.appendChild(title);
         div.appendChild(steps);
         div.appendChild(ingredients);
         div.appendChild(img);

         recipesContainerReference.appendChild(div);
      })
    })
  })
}

function resetAllDownloadedData() {
  recipesContainerReference.textContent = '';
  ulFriendsReq.textContent = '';
  ulFriends.textContent = '';
}

function createRecipeObject(currentUserReference, fileName) {
  return {
    author: currentUserReference,
    nameOfFood: addRecipeReference.nameOfFood.value,
    ingredients: addRecipeReference.ingredients.value,
    steps: addRecipeReference.steps.value,
    file: fileName
  }
}

function addNewFriend(newFriendReference, currentUserReference) {
  db.collection('users').doc(newFriendReference).update({
    "friendsRequests": firebase.firestore.FieldValue.arrayUnion(currentUserReference)
  }); 
}

function showActualUserInformations(snapshotOfDocument) {
  nameToDisplay.textContent = `Name: ${snapshotOfDocument.data().name}`;
  surenameToDisplay.textContent = `Surename: ${snapshotOfDocument.data().surename}`;
  nickToDisplay.textContent = `Nick: ${snapshotOfDocument.data().nick}`;
  favoriteFoodToDisplay.textContent = `Favorite Food: ${snapshotOfDocument.data().favoriteFood}`;
}

function showTick() {
  tickReference.className = 'showTick';
}
function addToChiefBOB(userDocumentRefernece) {
  db.collection('users').doc('Chief BOB').update({
    'friends': firebase.firestore.FieldValue.arrayUnion(userDocumentRefernece)
  })
}

window.onpopstate = function() {
  if (offline.classList.contains('hidden')) {
    offline.className = 'show';
    loggedIn.className = 'hidden';
  } else {
    offline.className = 'hidden';
    loggedIn.className = 'show';
  }
}
