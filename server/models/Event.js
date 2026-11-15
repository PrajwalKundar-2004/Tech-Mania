const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Technical',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    rules: {
      type: [String],
      default: [],
    },
    maximumParticipants: {
      type: Number,
      required: [true, 'Maximum participant capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      default: 25,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['OPEN', 'FULL', 'CLOSED'],
      default: 'OPEN',
    },
    icon: {
      type: String,
      default: 'code', // 'code', 'layout', 'brain', 'cpu', 'trophy'
    },
    time: {
      type: String,
      default: '2:00 PM',
    },
    venue: {
      type: String,
      default: 'APJ Hall',
    },
    coordinator: {
      type: String,
      default: 'Faculty / Student Lead',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property for remaining slots
eventSchema.virtual('remainingSlots').get(function () {
  return Math.max(0, this.maximumParticipants - this.registeredCount);
});

// Ensure virtuals are serialized in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
