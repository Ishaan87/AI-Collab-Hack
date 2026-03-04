import jwt from 'jsonwebtoken';

// Generate JWT from user row
export const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// Called after passport OAuth success — redirect to frontend with JWT
export const oauthSuccess = (req, res) => {
  const user = req.user;
  const token = generateToken(user);

  // Tell frontend whether profile setup is needed
  const isNewUser = !user.is_profile_complete;

  // Redirect to frontend with token
  const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&new=${isNewUser}`;
  res.redirect(redirectUrl);
};

// OAuth failure
export const oauthFailure = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
};
