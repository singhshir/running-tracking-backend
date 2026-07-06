
const User = require('../models/User');
const Run = require('../models/Run');
const { sendSuccess, sendError } = require('../utils/responseHandler');


const deleteMyAccount = async (req, res, next) => {
  try {
    // Remove all runs belonging to this user first (avoid orphaned data)
    await Run.deleteMany({ user: req.user._id });

    // Then remove the user account itself
    await User.findByIdAndDelete(req.user._id);

    // Clear the auth cookie since the account no longer exists
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    return sendSuccess(res, 200, 'Account and all associated runs deleted successfully');
  } catch (error) {
    next(error);
  }
};


const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name profileImage createdAt');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'User fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deleteMyAccount,
  getUserById,
};
