import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

const router = Router()

// Writing reviews needs an account. Reading them does not (see cafes.js).
router.use(requireAuth)

// Upsert the current user's review for a cafe. One review per user per cafe;
// posting again edits it.
router.post('/', async (req, res, next) => {
  try {
    const { cafeId, rating, text } = req.body ?? {}
    if (!cafeId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'cafeId and an integer rating 1-5 are required' })
    }

    const cafe = await prisma.cafe.findUnique({ where: { id: cafeId } })
    if (!cafe) return res.status(404).json({ error: 'That cafe could not be found.' })

    const note = typeof text === 'string' ? text.trim().slice(0, 500) || null : null

    const review = await prisma.review.upsert({
      where: { userId_cafeId: { userId: req.user.id, cafeId } },
      update: { rating, text: note },
      create: { userId: req.user.id, cafeId, rating, text: note }
    })

    // Logging a review implies a visit — keep the checklist in sync.
    await prisma.visit.upsert({
      where: { userId_cafeId: { userId: req.user.id, cafeId } },
      update: {},
      create: { userId: req.user.id, cafeId }
    })

    res.json({ review })
  } catch (err) {
    next(err)
  }
})

router.delete('/:cafeId', async (req, res, next) => {
  try {
    await prisma.review.deleteMany({
      where: { userId: req.user.id, cafeId: req.params.cafeId }
    })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
