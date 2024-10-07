const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Function to set admin custom claims
exports.setAdminCustomClaim = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // Get the UID and the admin status from the data
  const uid = data.uid;
  const isAdmin = data.isAdmin;

  // Set custom user claims for the user
  return admin.auth().setCustomUserClaims(uid, { admin: isAdmin }).then(() => {
    return {
      message: `Success! ${uid} has been made an admin.`
    };
  }).catch(err => {
    throw new functions.https.HttpsError('unknown', err.message, err);
  });
});

// Add an immediate execution block to set a specific user as admin
const makeAdminUser = async () => {
  const uid = 'kJo5vljHkFaqMOpMdsgRsCMIwxk1'; 
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Success! ${uid} has been made an admin.`);
  } catch (error) {
    console.error('Error setting admin claim:', error);
  }
};


makeAdminUser();

