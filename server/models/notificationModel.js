import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  time: { type: Date, required: true, default: Date.now },
  read: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 