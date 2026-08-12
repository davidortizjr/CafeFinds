import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// Upsert the current user's review for a cafe. One review per user per cafe;
// posting again edits it.
router.post('/', async (req, res, next) => {
  try {
    const { cafeId, rating, text } = req.body
    if (!cafeId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'cafeId and an integer rating 1-5 are required' })
    }

    const review = await prisma.review.upsert({
      where: { userId_cafeId: { userId: req.user.id, cafeId } },
      update: { rating, text: text ?? null },
      create: { userId: req.user.id, cafeId, rating, text: text ?? null }
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
