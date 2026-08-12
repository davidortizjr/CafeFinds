import serverless from 'serverless-http'
import app from '../server/index.js'

// Vercel treats every file in /api as its own serverless function.
// vercel.json rewrites all /api/* traffic to this single function, which
// hands the request to the same Express app used in local dev.
export default serverless(app)
