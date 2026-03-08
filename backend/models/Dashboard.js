const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  components: [
    {
      id: String,
      type: String,
      position: {
        x: Number,
        y: Number
      },
      size: {
        width: Number,
        height: Number
      },
      props: Object
    }
  ],
  theme: {
    type: String,
    default: 'dark-blue'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Dashboard', dashboardSchema);