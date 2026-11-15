const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events with real-time slot counts and status
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ order: 1, createdAt: 1 });
    
    // Calculate live counts from active registrations to ensure 100% sync
    const eventStats = await Promise.all(
      events.map(async (event) => {
        const actualCount = await Registration.countDocuments({
          eventId: event._id,
          registrationStatus: 'CONFIRMED',
        });

        // Ensure database stays in sync
        if (event.registeredCount !== actualCount) {
          event.registeredCount = actualCount;
          if (event.registeredCount >= event.maximumParticipants && event.status !== 'CLOSED') {
            event.status = 'FULL';
          } else if (event.registeredCount < event.maximumParticipants && event.status === 'FULL') {
            event.status = 'OPEN';
          }
          await event.save();
        }

        const remainingSlots = Math.max(0, event.maximumParticipants - actualCount);
        let dynamicStatus = event.status;
        if (event.status !== 'CLOSED') {
          dynamicStatus = actualCount >= event.maximumParticipants ? 'FULL' : 'OPEN';
        }

        return {
          id: event._id,
          _id: event._id,
          name: event.name,
          code: event.code,
          category: event.category,
          tagline: event.tagline,
          description: event.description,
          rules: event.rules,
          maximumParticipants: event.maximumParticipants,
          registeredCount: actualCount,
          remainingSlots,
          status: dynamicStatus,
          icon: event.icon,
          time: event.time,
          venue: event.venue,
          coordinator: event.coordinator,
          order: event.order,
          updatedAt: event.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: eventStats.length,
      data: eventStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events: ' + error.message,
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const actualCount = await Registration.countDocuments({
      eventId: event._id,
      registrationStatus: 'CONFIRMED',
    });

    const remainingSlots = Math.max(0, event.maximumParticipants - actualCount);

    res.status(200).json({
      success: true,
      data: {
        ...event.toJSON(),
        registeredCount: actualCount,
        remainingSlots,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error: ' + error.message });
  }
};

// @desc    Update event details (Admin)
// @route   PUT /api/events/:id
// @access  Private (Admin)
const updateEvent = async (req, res) => {
  try {
    const {
      name,
      tagline,
      description,
      rules,
      maximumParticipants,
      status,
      icon,
      time,
      venue,
      coordinator,
    } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (name) event.name = name.trim();
    if (tagline !== undefined) event.tagline = tagline.trim();
    if (description) event.description = description.trim();
    if (rules && Array.isArray(rules)) event.rules = rules;
    if (maximumParticipants !== undefined) {
      const parsedMax = parseInt(maximumParticipants, 10);
      if (isNaN(parsedMax) || parsedMax < 1) {
        return res.status(400).json({ success: false, error: 'Capacity must be at least 1' });
      }
      event.maximumParticipants = parsedMax;
    }
    if (status && ['OPEN', 'FULL', 'CLOSED'].includes(status)) {
      event.status = status;
    }
    if (icon) event.icon = icon;
    if (time) event.time = time.trim();
    if (venue) event.venue = venue.trim();
    if (coordinator) event.coordinator = coordinator.trim();

    // Re-check status against actual registrations
    const actualCount = await Registration.countDocuments({
      eventId: event._id,
      registrationStatus: 'CONFIRMED',
    });
    event.registeredCount = actualCount;
    if (event.status !== 'CLOSED') {
      event.status = actualCount >= event.maximumParticipants ? 'FULL' : 'OPEN';
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  updateEvent,
};
