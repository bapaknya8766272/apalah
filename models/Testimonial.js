import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: true,
        maxlength: 2000
    },
    ipAddress: String,
    isApproved: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Get approved testimonials
testimonialSchema.statics.getApproved = async function(limit = 50) {
    return await this.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};

// Get average rating
testimonialSchema.statics.getAverageRating = async function() {
    const result = await this.aggregate([
        { $match: { isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    return result[0]?.avg || 0;
};

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
