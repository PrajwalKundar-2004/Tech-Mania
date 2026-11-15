const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Setting = require('../models/Setting');

// Helper to get next available serial registration number between 1 and 55
const getNextSerialRegistrationNumber = async () => {
  const confirmedRegs = await Registration.find(
    { registrationStatus: 'CONFIRMED' },
    'registrationNumber'
  );

  const usedNumbers = new Set(
    confirmedRegs
      .map((r) => parseInt(r.registrationNumber, 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 55)
  );

  for (let i = 1; i <= 55; i++) {
    if (!usedNumbers.has(i)) {
      return String(i);
    }
  }

  return null;
};

// @desc    Register a participant for an event
// @route   POST /api/registrations
// @access  Public
const registerParticipant = async (req, res) => {
  try {
    let { fullName, email, usn, eventId } = req.body;

    // --- 1. Basic field presence checks ---
    if (!fullName || typeof fullName !== 'string') {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Gmail address is required.' });
    }
    if (!usn || typeof usn !== 'string') {
      return res.status(400).json({ success: false, error: 'USN is required.' });
    }
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, error: 'Valid event selection is required.' });
    }

    // --- 2. Normalization ---
    const trimmedName = fullName.trim().replace(/\s+/g, ' ');
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsn = usn.trim().toUpperCase();

    // --- 3. Field validation rules ---
    // Name validation
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return res.status(400).json({
        success: false,
        error: 'Name must be between 2 and 80 characters long.',
      });
    }
    // Name should contain at least letters, allowing spaces, dots, hyphens
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid full name (letters, spaces, and standard punctuation only).',
      });
    }

    // Gmail validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    // Fetch dynamic settings from database or fallback to env
    let gmailSetting = await Setting.findOne({ key: 'GMAIL_ONLY' });
    const isGmailOnly = gmailSetting ? gmailSetting.value === true : process.env.GMAIL_ONLY !== 'false';
    if (isGmailOnly && !normalizedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        error: 'Only valid Gmail addresses (@gmail.com) are accepted for registration.',
      });
    }

    // USN validation (strictly numbers between 1 and 55)
    const usnNum = parseInt(normalizedUsn, 10);
    if (isNaN(usnNum) || usnNum < 1 || usnNum > 55 || String(usnNum) !== normalizedUsn) {
      return res.status(400).json({
        success: false,
        error: 'Invalid USN. Please enter a number between 1 and 55.',
      });
    }

    // --- 4. Verify target event exists and is not manually closed ---
    const targetEvent = await Event.findById(eventId);
    if (!targetEvent) {
      return res.status(404).json({ success: false, error: 'Selected event not found.' });
    }
    if (targetEvent.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: `Registrations for ${targetEvent.name} are currently closed by the administrator.`,
      });
    }

    // --- 5. CRITICAL RESTRICTION CHECKS (RULE 2 & RULE 3) ---
    // Check if participant already registered anywhere by USN
    const existingRegistrationByUsn = await Registration.findOne({
      usn: normalizedUsn,
      registrationStatus: 'CONFIRMED',
    });

    if (existingRegistrationByUsn) {
      if (existingRegistrationByUsn.eventId.toString() === eventId.toString()) {
        return res.status(400).json({
          success: false,
          error: 'You have already registered for this event. Duplicate registrations are not allowed.',
          alreadyRegisteredEvent: existingRegistrationByUsn.eventName,
          existingRegistration: {
            id: existingRegistrationByUsn._id,
            registrationNumber: existingRegistrationByUsn.registrationNumber,
            fullName: existingRegistrationByUsn.fullName,
            eventName: existingRegistrationByUsn.eventName,
            usn: existingRegistrationByUsn.usn,
            registeredAt: existingRegistrationByUsn.registeredAt,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          error: `You have already registered for ${existingRegistrationByUsn.eventName}. Each participant is allowed to register for only one event.`,
          alreadyRegisteredEvent: existingRegistrationByUsn.eventName,
        });
      }
    }

    // Check if participant already registered anywhere by Email
    const existingRegistrationByEmail = await Registration.findOne({
      email: normalizedEmail,
      registrationStatus: 'CONFIRMED',
    });

    if (existingRegistrationByEmail) {
      if (existingRegistrationByEmail.eventId.toString() === eventId.toString()) {
        return res.status(400).json({
          success: false,
          error: 'You have already registered for this event. Duplicate registrations are not allowed.',
          alreadyRegisteredEvent: existingRegistrationByEmail.eventName,
          existingRegistration: {
            id: existingRegistrationByEmail._id,
            registrationNumber: existingRegistrationByEmail.registrationNumber,
            fullName: existingRegistrationByEmail.fullName,
            eventName: existingRegistrationByEmail.eventName,
            usn: existingRegistrationByEmail.usn,
            registeredAt: existingRegistrationByEmail.registeredAt,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          error: `You have already registered for ${existingRegistrationByEmail.eventName}. Each participant is allowed to register for only one event.`,
          alreadyRegisteredEvent: existingRegistrationByEmail.eventName,
        });
      }
    }

    // --- 6. ATOMIC CAPACITY CHECK & RESERVATION (RULE 1 & RULE 5) ---
    // Concurrency safe: Only increment if registeredCount is strictly less than maximumParticipants
    const reservedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: { $ne: 'CLOSED' },
        $expr: { $lt: ['$registeredCount', '$maximumParticipants'] },
      },
      {
        $inc: { registeredCount: 1 },
      },
      { returnDocument: 'after' }
    );

    if (!reservedEvent) {
      // Could not increment -> either event is closed or full
      await Event.findByIdAndUpdate(eventId, { status: 'FULL' });
      return res.status(400).json({
        success: false,
        error: 'Registration Closed – All Slots Filled.',
      });
    }

    // If event reached max capacity, update status flag
    if (reservedEvent.registeredCount >= reservedEvent.maximumParticipants) {
      await Event.findByIdAndUpdate(eventId, { status: 'FULL' });
    }

    // --- 7. CREATE REGISTRATION RECORD WITH SERIAL NUMBER (1 to 55) ---
    let newRegistration = null;
    let createAttempts = 0;
    const maxAttempts = 3;

    while (!newRegistration && createAttempts < maxAttempts) {
      createAttempts++;
      const regNumber = await getNextSerialRegistrationNumber();

      if (!regNumber) {
        await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
        return res.status(400).json({
          success: false,
          error: 'Registration full. All 55 seats across TECHMANIA 2.0 events are occupied.',
        });
      }

      try {
        newRegistration = await Registration.create({
          registrationNumber: regNumber,
          fullName: trimmedName,
          email: normalizedEmail,
          usn: normalizedUsn,
          eventId: reservedEvent._id,
          eventName: reservedEvent.name,
          eventCode: reservedEvent.code,
          registrationStatus: 'CONFIRMED',
          ipAddress: req.ip || req.connection?.remoteAddress || '',
        });
      } catch (createErr) {
        if (createErr.code === 11000 && createErr.keyPattern?.registrationNumber) {
          // Serial number collision under concurrency, retry finding next available
          continue;
        }

        // Rollback reserved slot count immediately
        await Event.findByIdAndUpdate(eventId, {
          $inc: { registeredCount: -1 },
        });

        // Restore status if it was prematurely marked FULL
        const recheckEvent = await Event.findById(eventId);
        if (recheckEvent && recheckEvent.status === 'FULL' && recheckEvent.registeredCount < recheckEvent.maximumParticipants) {
          await Event.findByIdAndUpdate(eventId, { status: 'OPEN' });
        }

        if (createErr.code === 11000) {
          if (createErr.keyPattern?.usn) {
            return res.status(400).json({
              success: false,
              error: 'Duplicate registration detected. This USN has already been registered.',
            });
          }
          if (createErr.keyPattern?.email) {
            return res.status(400).json({
              success: false,
              error: 'Duplicate registration detected. This Gmail address has already been registered.',
            });
          }
        }

        throw createErr;
      }
    }

    // Calculate updated remaining slots
    const remainingSlots = Math.max(0, reservedEvent.maximumParticipants - reservedEvent.registeredCount);

    return res.status(201).json({
      success: true,
      message: `Congratulations! Your registration for ${reservedEvent.name} has been confirmed.`,
      data: {
        _id: newRegistration._id,
        id: newRegistration._id,
        registrationNumber: newRegistration.registrationNumber,
        fullName: newRegistration.fullName,
        email: newRegistration.email,
        usn: newRegistration.usn,
        eventId: reservedEvent._id,
        eventName: reservedEvent.name,
        eventCode: reservedEvent.code,
        venue: reservedEvent.venue,
        time: reservedEvent.time,
        registeredAt: newRegistration.registeredAt,
      },
      eventStatus: {
        registeredCount: reservedEvent.registeredCount,
        maximumParticipants: reservedEvent.maximumParticipants,
        remainingSlots,
        status: reservedEvent.registeredCount >= reservedEvent.maximumParticipants ? 'FULL' : 'OPEN',
      },
    });
  } catch (error) {
    console.error('Registration processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred during registration. Please try again.',
      details: error.message,
    });
  }
};

// @desc    Check registration status by USN or Email (lookup helper)
// @route   GET /api/registrations/check
// @access  Public
const checkRegistration = async (req, res) => {
  try {
    const { usn, email } = req.query;
    if (!usn && !email) {
      return res.status(400).json({ success: false, error: 'Provide USN or Email to query.' });
    }

    const query = { registrationStatus: 'CONFIRMED' };
    if (usn) query.usn = usn.trim().toUpperCase();
    if (email) query.email = email.trim().toLowerCase();

    const registration = await Registration.findOne(query).populate('eventId', 'name venue time category');
    if (!registration) {
      return res.status(200).json({ success: true, registered: false });
    }

    return res.status(200).json({
      success: true,
      registered: true,
      data: {
        _id: registration._id,
        id: registration._id,
        registrationNumber: registration.registrationNumber,
        fullName: registration.fullName,
        usn: registration.usn,
        email: registration.email,
        eventName: registration.eventName,
        event: registration.eventId,
        registeredAt: registration.registeredAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  registerParticipant,
  checkRegistration,
};
