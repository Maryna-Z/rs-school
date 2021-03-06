const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');//allow url friendly names for our slugs

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter an event name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now()
  },
  start: {
    type: Date,
    default: Date.now(),
    require: 'Please specify the begining of the event'
  },
  end: {
    type: Date,
    default: Date.now(),
    require: 'Please specify the ending of the event'
  },
  duration: Number,
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply address!'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author!'
  },
  speakers: [{ type: mongoose.Schema.ObjectId, ref: 'Speaker' }]
});

eventSchema.index({
  name: 'text',
  description: 'text'
})

eventSchema.index({
  location: '2dsphere' //geospatial data
});

eventSchema.pre('save', async function(next) {
  if(!this.isModified('name')){
    next();
    return;
  }
  this.slug = slug(this.name);

  //handle the same named slugs
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const eventsWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(eventsWithSlug.length) {
    this.slug = `${this.slug}-${eventsWithSlug.length}`;
  }
  next();
})

eventSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id:'$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
}

module.exports = mongoose.model('Event', eventSchema)
