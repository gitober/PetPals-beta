// Beta: fills the database with a few pretend pet owners, posts, likes,
// comments and follows, so testers see a lively feed from the start.
//
// Run with:  npm run seed
// Safe to run again: it removes the old seed data first and recreates it.
// Test accounts and anything testers made are not touched.

require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

const SEED_EMAIL_DOMAIN = "@petpals.seed";

// Images already in backend/uploads, so they are deployed with the code
const PETS = [
  {
    username: "daisy_dachs",
    bioText: "Small legs, big heart",
    profilePicture: "uploads/1736194896293-dachshund_8120554_1280.jpg",
    posts: [
      { image: "1736194896293-dachshund_8120554_1280.jpg", content: "Daisy found the only sunny spot in the whole garden ☀️" },
      { image: "1736719875024-dachshund_8120554_1280.jpg", content: "Walkies done, nap time next. Priorities." },
    ],
  },
  {
    username: "otto_the_pug",
    bioText: "Professional snorer",
    profilePicture: "uploads/1736195101226-pug_8632718_1280.jpg",
    posts: [
      { image: "1736195101226-pug_8632718_1280.jpg", content: "Otto heard the treat bag from three rooms away 👀" },
      { image: "1736261089064-pug_8632718_1280.jpg", content: "Monday mood, captured perfectly." },
    ],
  },
  {
    username: "luna_cat",
    bioText: "Queen of the windowsill",
    profilePicture: "uploads/1736194297676-cat_8198720_1280.jpg",
    posts: [
      { image: "1736194297676-cat_8198720_1280.jpg", content: "Luna has decided the laptop is her new bed. I work elsewhere now." },
      { image: "1736206031668-cat_8436848_1280.jpg", content: "Caught mid-judgement 😼" },
      { image: "1736194315230-cats_8105667_1280.jpg", content: "Luna and her cousin, plotting something again." },
    ],
  },
  {
    username: "bella_shihtzu",
    bioText: "Fluff with attitude",
    profilePicture: "uploads/1736195137659-shih_tzu_8287355_1280.jpg",
    posts: [
      { image: "1736195137659-shih_tzu_8287355_1280.jpg", content: "Fresh from the groomer and very aware of it ✨" },
      { image: "1736195148588-dog_8232158_1280.jpg", content: "Park friends are the best friends." },
    ],
  },
  {
    username: "milo_and_co",
    bioText: "Two cats, zero rules",
    profilePicture: "uploads/1736194879165-cats_8096304_1280.jpg",
    posts: [
      { image: "1736194879165-cats_8096304_1280.jpg", content: "Milo and Pepper sharing a box like civilised gentlemen 📦" },
      { image: "1736195161769-pexels_pixabay_160846.jpg", content: "Lazy Sunday, nobody is moving." },
      { image: "1736719702766-dog_8445917_1280.jpg", content: "Dog-sitting for the neighbours. The cats are not impressed." },
    ],
  },
];

const COMMENTS = [
  "So cute! 😍",
  "This made my day",
  "Look at that face!",
  "My dog does the exact same thing 😂",
  "Absolutely adorable",
  "Need more photos like this",
];

const removeOldSeed = async () => {
  const oldUsers = await User.find({ email: { $regex: `${SEED_EMAIL_DOMAIN.replace(".", "\\.")}$` } }).select("_id");
  const ids = oldUsers.map((user) => user._id);
  if (!ids.length) return;

  const oldPosts = await Post.find({ user_id: { $in: ids } }).select("_id");
  await Comment.deleteMany({ $or: [{ postId: { $in: oldPosts.map((post) => post._id) } }, { user_id: { $in: ids } }] });
  await Post.deleteMany({ user_id: { $in: ids } });
  await Post.updateMany({}, { $pull: { likes: { $in: ids } } });
  await User.updateMany({}, { $pull: { followers: { $in: ids }, following: { $in: ids } } });
  await User.deleteMany({ _id: { $in: ids } });
  console.log(`Removed ${ids.length} old seed users`);
};

const pickSome = (items, count) =>
  [...items].sort(() => Math.random() - 0.5).slice(0, count);

const seed = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    throw new Error("MONGO_URI is missing, add it to backend/.env");
  }

  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB");

  await removeOldSeed();

  // Seed accounts get a random password, nobody logs in as them
  const users = [];
  for (const pet of PETS) {
    const password = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
    users.push(
      await User.create({
        username: pet.username,
        email: `${pet.username}${SEED_EMAIL_DOMAIN}`,
        password,
        bioText: pet.bioText,
        profilePicture: pet.profilePicture,
        isTestUser: false,
      })
    );
  }

  // Posts, spread out over the last few days so the feed looks natural
  const posts = [];
  let hoursAgo = 2;
  PETS.forEach((pet, index) => {
    pet.posts.forEach((post) => {
      const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      hoursAgo += 7;
      posts.push({ ...post, user: users[index], createdAt });
    });
  });

  const savedPosts = [];
  for (const post of posts) {
    const others = users.filter((user) => !user._id.equals(post.user._id));
    savedPosts.push(
      await Post.create({
        content: post.content,
        image: `/uploads/${post.image}`,
        user_id: post.user._id,
        likes: pickSome(others, 1 + Math.floor(Math.random() * others.length)).map((user) => user._id),
        createdAt: post.createdAt,
        updatedAt: post.createdAt,
      })
    );
  }

  // A comment or two on most posts
  let commentCount = 0;
  for (const post of savedPosts) {
    const commenters = pickSome(
      users.filter((user) => !user._id.equals(post.user_id)),
      Math.floor(Math.random() * 3)
    );
    for (const commenter of commenters) {
      await Comment.create({
        postId: post._id,
        user_id: commenter._id,
        content: pickSome(COMMENTS, 1)[0],
      });
      commentCount++;
    }
  }

  // Everyone follows a couple of the others
  for (const user of users) {
    const toFollow = pickSome(users.filter((other) => !other._id.equals(user._id)), 2);
    for (const other of toFollow) {
      await User.updateOne({ _id: user._id }, { $addToSet: { following: other._id } });
      await User.updateOne({ _id: other._id }, { $addToSet: { followers: user._id } });
    }
  }

  console.log(`Created ${users.length} pets, ${savedPosts.length} posts and ${commentCount} comments`);
};

seed()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
