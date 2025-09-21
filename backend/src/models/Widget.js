import mongoose from 'mongoose';

const widgetSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    versionKey: false,
  }
);

const Widget = mongoose.model('Widget', widgetSchema);

export default Widget;


