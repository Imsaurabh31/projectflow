const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Soft delete via archive — no hard deletes on projects
  },
  { timestamps: true }
);

// Ensure owner is always in members list
projectSchema.pre('save', function (next) {
  const ownerStr = this.owner.toString();
  const memberStrs = this.members.map((m) => m.toString());
  if (!memberStrs.includes(ownerStr)) {
    this.members.push(this.owner);
  }
  next();
});

// Virtual: task count (populated when needed via aggregation)
projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
