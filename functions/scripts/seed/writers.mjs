export const writeUserDocuments = (firestore, writer, user, counters = {}) => {
  const profileRef = firestore.collection('profiles').doc(user.uid);

  void writer.set(profileRef, { ...user.profile, ...counters });
  void writer.set(firestore.collection('users').doc(user.uid), user.account);
  void writer.set(firestore.collection('usernames').doc(user.username), {
    uid: user.uid,
    createdAt: user.account.createdAt,
  });
  user.days.forEach(
    (day) => void writer.set(profileRef.collection('dailyStats').doc(day.date), day)
  );
};
