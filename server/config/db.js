import mongoose from "mongoose"

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      family: 4,
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB connected");

  } catch (error) {
    console.error("MongoDB error:", error.message);
  }
}

export default connectDb