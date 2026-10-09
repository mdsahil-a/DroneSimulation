// Centralized error handler — must be registered last in app.js
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500
  const message = err.message || 'Internal server error'
  console.error(`[ERROR] ${req.method} ${req.path} →`, message)
  res.status(status).json({ success: false, message })
}
